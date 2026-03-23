import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_BASE_URL } from '@/lib/constants';
import { toast } from 'sonner';

interface UseWebSocketOptions {
  receiptId?: string;
  onProgress?: (data: any) => void;
  onComplete?: (data: any) => void;
  onError?: (error: any) => void;
}

// Global socket instance to prevent multiple connections
let globalSocket: Socket | null = null;
let currentReceiptId: string | null = null;

export const useWebSocket = ({ receiptId, onProgress, onComplete, onError }: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const callbacksRef = useRef({ onProgress, onComplete, onError });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onProgress, onComplete, onError };
  }, [onProgress, onComplete, onError]);

  const connect = useCallback(() => {
    if (!receiptId) return;

    // If socket exists and we're switching receipt IDs, disconnect first
    if (globalSocket && currentReceiptId !== receiptId) {
      console.log(`🔄 Switching from ${currentReceiptId} to ${receiptId}`);
      globalSocket.disconnect();
      globalSocket = null;
    }

    // Don't reconnect if we already have a socket for this receipt
    if (globalSocket && currentReceiptId === receiptId) {
      setIsConnected(globalSocket.connected);
      return;
    }

    console.log(`🔌 Connecting to WebSocket: ${WS_BASE_URL}/receipts`);
    currentReceiptId = receiptId;

    globalSocket = io(`${WS_BASE_URL}/receipts`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 3000,
      timeout: 20000,
      withCredentials: false,
    });

    globalSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', globalSocket?.id);
      setIsConnected(true);
      setReconnectAttempt(0);
      
      // Subscribe to receipt updates
      globalSocket?.emit('subscribe', receiptId);
      console.log(`📡 Subscribed to receipt: ${receiptId}`);
    });

    globalSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      setIsConnected(false);
      setReconnectAttempt(prev => prev + 1);
      
      if (reconnectAttempt >= 3) {
        toast.error('Connection lost. Retrying...', { duration: 2000 });
      }
    });

    globalSocket.on('progress', (data) => {
      console.log('📊 Progress update:', data);
      callbacksRef.current.onProgress?.(data);
    });

    globalSocket.on('complete', (data) => {
      console.log('✅ Analysis complete:', data);
      callbacksRef.current.onComplete?.(data);
    });

    globalSocket.on('error', (errorData) => {
      console.error('❌ WebSocket error:', errorData);
      callbacksRef.current.onError?.(errorData);
      toast.error(`Analysis failed: ${errorData.error}`, { duration: 5000 });
    });

    globalSocket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    globalSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      toast.success('Connection restored!', { duration: 2000 });
      
      // Re-subscribe after reconnection
      if (currentReceiptId) {
        globalSocket?.emit('subscribe', currentReceiptId);
      }
    });
  }, [receiptId, reconnectAttempt]);

  const disconnect = useCallback(() => {
    if (globalSocket) {
      console.log('🔌 Disconnecting WebSocket');
      globalSocket.disconnect();
      globalSocket = null;
      currentReceiptId = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (receiptId) {
      connect();
    }

    // Cleanup on unmount or receipt change
    return () => {
      if (currentReceiptId !== receiptId) {
        disconnect();
      }
    };
  }, [receiptId, connect, disconnect]);

  return { 
    connect, 
    disconnect, 
    isConnected,
    socket: globalSocket 
  };
};
