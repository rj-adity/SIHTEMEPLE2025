import { useEffect, useRef, useState, useCallback } from 'react';

interface TempleUpdate {
  type: 'status_update';
  templeId: string;
  timestamp: string;
  currentVisitors: number;
  queueLength: number;
  occupancyPercent: number;
  avgWaitTime: number;
  alerts: Alert[];
}

interface Alert {
  id: string;
  type: 'medical' | 'crowd' | 'security' | 'maintenance';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface UseWebSocketOptions {
  templeId: string;
  onUpdate?: (update: TempleUpdate) => void;
  onAlert?: (alert: Alert) => void;
  reconnectInterval?: number;
}

interface WebSocketState {
  connected: boolean;
  lastUpdate: TempleUpdate | null;
  alerts: Alert[];
  error: string | null;
}

export function useWebSocket({
  templeId,
  onUpdate,
  onAlert,
  reconnectInterval = 5000
}: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    lastUpdate: null,
    alerts: [],
    error: null
  });

  const connect = useCallback(() => {
    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws?templeId=${templeId}`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log(`🔌 Connected to WebSocket for temple: ${templeId}`);
        setState(prev => ({ ...prev, connected: true, error: null }));
        
        // Clear any existing reconnect timer
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'status_update') {
            const update = data as TempleUpdate;
            setState(prev => ({ 
              ...prev, 
              lastUpdate: update,
              alerts: [...update.alerts, ...prev.alerts].slice(0, 20) // Keep last 20 alerts
            }));
            
            onUpdate?.(update);
            
            // Trigger alert callbacks for new alerts
            update.alerts.forEach(alert => onAlert?.(alert));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log(`🔌 WebSocket disconnected for temple: ${templeId}`, event.code, event.reason);
        setState(prev => ({ ...prev, connected: false }));
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000) {
          reconnectTimer.current = setTimeout(() => {
            console.log(`🔄 Attempting to reconnect WebSocket for temple: ${templeId}`);
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        console.error(`🔌 WebSocket error for temple: ${templeId}`, error);
        setState(prev => ({ ...prev, error: 'WebSocket connection error' }));
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setState(prev => ({ ...prev, error: 'Failed to create WebSocket connection' }));
    }
  }, [templeId, onUpdate, onAlert, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Component unmounting');
      ws.current = null;
    }
    
    setState(prev => ({ ...prev, connected: false }));
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const requestUpdate = useCallback(() => {
    sendMessage({ type: 'request_update' });
  }, [sendMessage]);

  const simulateSurge = useCallback(() => {
    sendMessage({ type: 'simulate_surge' });
  }, [sendMessage]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  // Reconnect when templeId changes
  useEffect(() => {
    if (ws.current) {
      disconnect();
      setTimeout(connect, 100); // Small delay to ensure clean disconnect
    }
  }, [templeId, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    requestUpdate,
    simulateSurge
  };
}