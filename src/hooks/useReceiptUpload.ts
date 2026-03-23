import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/lib/constants';

export interface UploadProgress {
  progress: number;
  status: string;
  message: string;
}

export const useReceiptUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle',
    message: '',
  });

  const uploadReceipt = useCallback(async (file: File, options?: { anchorOnHedera?: boolean }) => {
    setIsUploading(true);
    setProgress({ progress: 0, status: 'uploading', message: 'Preparing upload...' });

    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setProgress({
            progress: 0,
            status: 'retrying',
            message: `Retrying... (Attempt ${attempt + 1}/${maxRetries + 1})`
          });
          // Exponential backoff: 2s, 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        if (options?.anchorOnHedera) {
          formData.append('anchorOnHedera', 'true');
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for upload

        try {
          // Upload to backend
          const response = await fetch(API_ENDPOINTS.SCAN_RECEIPT, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            // Handle specific HTTP errors
            if (response.status === 502 || response.status === 503) {
              throw new Error(
                'Backend service is starting up (cold start). This may take 30-60 seconds on the free tier. Please wait and try again.'
              );
            }
            if (response.status === 504) {
              throw new Error('Request timed out. The image might be too large or the service is busy.');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
          }

          const result = await response.json();

          setProgress({ progress: 100, status: 'complete', message: 'Upload successful!' });

          return result;
        } catch (fetchError: any) {
          clearTimeout(timeoutId);

          // Handle abort/timeout
          if (fetchError.name === 'AbortError') {
            throw new Error('Upload timed out. Please check your connection and try again.');
          }

          throw fetchError;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Upload failed');

        // Don't retry on certain errors
        const errorMessage = lastError.message.toLowerCase();
        if (errorMessage.includes('invalid') || errorMessage.includes('format')) {
          break; // Don't retry on validation errors
        }

        // If this is not the last attempt, continue to retry
        if (attempt < maxRetries) {
          console.log(`Upload attempt ${attempt + 1} failed, retrying...`, lastError);
          continue;
        }
      }
    }

    // All retries exhausted
    const errorMessage = lastError?.message || 'Upload failed';
    setProgress({ progress: 0, status: 'error', message: errorMessage });
    toast.error(errorMessage);
    throw lastError;
  }, []);

  const updateProgress = useCallback((update: Partial<UploadProgress>) => {
    setProgress((prev) => ({ ...prev, ...update }));
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress({ progress: 0, status: 'idle', message: '' });
  }, []);

  return {
    isUploading,
    progress,
    uploadReceipt,
    updateProgress,
    reset,
  };
};
