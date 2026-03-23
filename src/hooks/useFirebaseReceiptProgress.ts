/**
 * Firebase Real-time Progress Listener
 * Includes automatic hydration of flattened Firestore data
 */
import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

interface AgentProgress {
  agent: string;
  stage: string;
  message: string;
  progress: number;
  timestamp: string;
  details?: Record<string, any>;
}

/**
 * ROBUST PARSER - Handles valid JSON, Python-style strings, and plain text
 */
const safeParse = (data: any) => {
  if (data === null || data === undefined) return null;

  // If it's already an object, return it (Firestore might interpret maps automatically)
  if (typeof data === 'object') return data;

  // If it's a number or boolean, return it
  if (typeof data !== 'string') return data;

  // It's a string. Try to parse it.
  try {
    // 1. Try standard JSON parse
    const parsed = JSON.parse(data);

    // Handle double-encoded strings (e.g., '"[...]"')
    if (typeof parsed === 'string') {
      try {
        return JSON.parse(parsed);
      } catch (e) {
        return parsed;
      }
    }

    return parsed;
  } catch (e) {
    // 2. Try fixing Python-style syntax (Single quotes, True/False/None)
    // Only attempt this if it looks like an object or array
    const trimmed = data.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const pythonToJSON = data
          .replace(/'/g, '"')
          .replace(/\bTrue\b/g, 'true')
          .replace(/\bFalse\b/g, 'false')
          .replace(/\bNone\b/g, 'null');
        return JSON.parse(pythonToJSON);
      } catch (e2) {
        console.warn('Failed to parse complex string data:', data.substring(0, 100) + '...');
        // 3. If parsing fails, it might be a simple string message (e.g., "Fraudulent")
        // Just return the string itself rather than crashing or returning null
        return data;
      }
    }
    // It's just a normal string (e.g., "Merchant Name")
    return data;
  }
};

interface UseFirebaseReceiptProgressOptions {
  receiptId?: string;
  onProgress?: (data: AgentProgress) => void;
  onComplete?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useFirebaseReceiptProgress = ({
  receiptId,
  onProgress,
  onComplete,
  onError,
}: UseFirebaseReceiptProgressOptions) => {
  const [isListening, setIsListening] = useState(false);
  const callbacksRef = useRef({ onProgress, onComplete, onError });
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onProgress, onComplete, onError };
  }, [onProgress, onComplete, onError]);

  useEffect(() => {
    if (!receiptId || !db) {
      console.log('⚠️ No receipt ID or Firebase not initialized');
      return;
    }

    console.log(`🔥 Starting Firebase listener for receipt: ${receiptId}`);
    setIsListening(true);

    const receiptRef = doc(db, 'receipts', receiptId);

    // Real-time listener
    const unsubscribe = onSnapshot(
      receiptRef,
      async (docSnapshot) => {  // Made callback async
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          console.log('🔥 Firebase update received:', data);

          // 1. Handle Progress Updates
          if (data.progress_agent && data.progress_stage && data.status !== 'completed') {
            const progress: AgentProgress = {
              agent: data.progress_agent,
              stage: data.progress_stage,
              message: data.progress_message || '',
              progress: data.progress_percentage || 0,
              timestamp: data.progress_timestamp || new Date().toISOString(),
              details: {}
            };

            // Extract detail fields (progress_detail_*)
            Object.keys(data).forEach(key => {
              if (key.startsWith('progress_detail_')) {
                const detailKey = key.replace('progress_detail_', '');
                // Recursively parse details if they were stored as strings
                progress.details![detailKey] = safeParse(data[key]);
              }
            });

            console.log(`📊 [${progress.agent}] ${progress.message} (${progress.progress}%)`);
            callbacksRef.current.onProgress?.(progress);
          }

          // 2. Handle Completion - WITH SIDECAR PATTERN
          if (data.status === 'completed' && data.analysis) {
            try {
              console.log('✅ Analysis completed. Fetching Sidecar data...');

              const raw = data.analysis;
              const forensic = raw.forensic_details || {};

              // Helper to ensure array
              const ensureArray = (val: any) => Array.isArray(val) ? val : [];

              // Hydrate the strings back into objects for the UI
              let hydratedData = {
                ...raw,
                // Include root-level fields
                ocr_text: data.ocr_text || '',
                processing_time: data.processing_time,
                agent_logs: ensureArray(safeParse(raw.agent_logs)),
                forensic_details: {
                  ...forensic,
                  // Hydrate ALL lightweight fields
                  forensic_findings: ensureArray(safeParse(forensic.forensic_findings)),
                  heatmap: ensureArray(safeParse(forensic.heatmap)),
                  pixel_diff: safeParse(forensic.pixel_diff) || {},
                  technical_details: safeParse(forensic.technical_details) || {},
                  agent_logs: ensureArray(safeParse(forensic.agent_logs)),
                }
              };

              // ⚡️ SIDECAR PATTERN: Fetch heavy forensic data from subcollection
              try {
                const sidecarRef = doc(db, 'receipts', receiptId, 'details', 'forensics');
                const sidecarSnap = await getDoc(sidecarRef);

                if (sidecarSnap.exists()) {
                  console.log('📦 Sidecar data found and merged.');
                  const sidecar = sidecarSnap.data();

                  // Merge heavy data back into the structure for the UI
                  hydratedData = {
                    ...hydratedData,
                    agent_logs: sidecar.agent_logs || hydratedData.agent_logs,
                    forensic_details: {
                      ...hydratedData.forensic_details,
                      heatmap: sidecar.heatmap || [],
                      pixel_diff: sidecar.pixel_diff || {},
                      technical_details: sidecar.technical_details || {},
                      ela_analysis: sidecar.ela_analysis || {},
                      forensic_findings: sidecar.forensic_findings_full || hydratedData.forensic_details.forensic_findings,
                      forensic_progress: sidecar.forensic_progress || hydratedData.forensic_details?.forensic_progress || [],
                      agent_logs: sidecar.agent_logs || hydratedData.forensic_details?.agent_logs || [],
                      image_dimensions: sidecar.image_dimensions,
                      statistics: sidecar.statistics,
                    }
                  };
                } else {
                  console.warn('⚠️ No sidecar data found (may be legacy receipt)');
                }
              } catch (err) {
                console.warn('⚠️ Could not fetch sidecar data:', err);
                // Continue with what we have
              }

              // Ensure backward compatibility for ELAHeatmapViewer
              if (hydratedData.forensic_details.technical_details) {
                const td = hydratedData.forensic_details.technical_details;
                if (typeof td.ela_analysis === 'string') {
                  td.ela_analysis = safeParse(td.ela_analysis);
                }
              }

              console.log('✅ Data hydrated successfully:', {
                hasHeatmap: Array.isArray(hydratedData.forensic_details.heatmap),
                rows: hydratedData.forensic_details.heatmap?.length,
                hasSidecar: !!hydratedData.forensic_details.pixel_diff
              });

              callbacksRef.current.onComplete?.(hydratedData);
            } catch (err) {
              console.error('❌ Hydration error:', err);
              // Fallback to raw data if hydration fails
              callbacksRef.current.onComplete?.(data.analysis);
            }
          }

          // Check for errors
          if (data.status === 'failed' && data.error) {
            console.error('❌ Analysis failed:', data.error);
            callbacksRef.current.onError?.(data.error);
          }
        } else {
          console.log('⚠️ Receipt document does not exist yet');
        }
      },
      (error) => {
        console.error('❌ Firebase listener error:', error);
        setIsListening(false);
        callbacksRef.current.onError?.(error);
      }
    );

    unsubscribeRef.current = unsubscribe;

    // Cleanup on unmount or receipt change
    return () => {
      console.log(`🔥 Stopping Firebase listener for receipt: ${receiptId}`);
      unsubscribe();
      unsubscribeRef.current = null;
      setIsListening(false);
    };
  }, [receiptId]);

  const stopListening = () => {
    if (unsubscribeRef.current) {
      console.log('🔥 Manually stopping Firebase listener');
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      setIsListening(false);
    }
  };

  return { isListening, stopListening };
};
