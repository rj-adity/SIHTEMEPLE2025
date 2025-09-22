import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

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

interface ConnectedClient {
  ws: WebSocket;
  templeId: string;
  clientId: string;
}

class TempleWebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, ConnectedClient> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🔌 WebSocket server initialized');
  }

  private handleConnection(ws: WebSocket, request: any) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const templeId = url.searchParams.get('templeId') || 'dwarka';
    const clientId = this.generateClientId();

    console.log(`📱 Client connected to temple: ${templeId}`);

    // Store client connection
    this.clients.set(clientId, { ws, templeId, clientId });

    // Send initial status
    this.sendTempleUpdate(templeId, clientId);

    // Start periodic updates for this temple if not already running
    if (!this.updateIntervals.has(templeId)) {
      this.startPeriodicUpdates(templeId);
    }

    // Handle client messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleClientMessage(clientId, message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      console.log(`📱 Client disconnected: ${clientId}`);
      this.clients.delete(clientId);
      
      // Stop updates if no clients for this temple
      const hasClientsForTemple = Array.from(this.clients.values())
        .some(client => client.templeId === templeId);
      
      if (!hasClientsForTemple && this.updateIntervals.has(templeId)) {
        clearInterval(this.updateIntervals.get(templeId)!);
        this.updateIntervals.delete(templeId);
        console.log(`⏹️ Stopped updates for temple: ${templeId}`);
      }
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
    });
  }

  private handleClientMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
      
      case 'request_update':
        this.sendTempleUpdate(client.templeId, clientId);
        break;
      
      case 'simulate_surge':
        this.simulateCrowdSurge(client.templeId);
        break;
      
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  private startPeriodicUpdates(templeId: string) {
    console.log(`▶️ Starting periodic updates for temple: ${templeId}`);
    
    const interval = setInterval(() => {
      this.broadcastTempleUpdate(templeId);
    }, 3000); // Update every 3 seconds

    this.updateIntervals.set(templeId, interval);
  }

  private generateTempleUpdate(templeId: string): TempleUpdate {
    // Simulate realistic temple data with some randomness
    const baseData = this.getBaseTempleData(templeId);
    
    // Add some realistic fluctuation
    const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% change
    const currentVisitors = Math.max(1000, 
      Math.round(baseData.currentVisitors * (1 + fluctuation))
    );
    
    const capacity = this.getTempleCapacity(templeId);
    const occupancyPercent = Math.min(98, Math.round((currentVisitors / capacity) * 100));
    
    const queueLength = Math.max(0, 
      Math.round(currentVisitors * (0.02 + Math.random() * 0.03))
    );
    
    const avgWaitTime = Math.max(5, 
      Math.round(queueLength * (0.03 + Math.random() * 0.02))
    );

    // Generate random alerts occasionally
    const alerts: Alert[] = [];
    if (Math.random() < 0.1) { // 10% chance of alert
      alerts.push(this.generateRandomAlert(templeId));
    }

    return {
      type: 'status_update',
      templeId,
      timestamp: new Date().toISOString(),
      currentVisitors,
      queueLength,
      occupancyPercent,
      avgWaitTime,
      alerts
    };
  }

  private getBaseTempleData(templeId: string) {
    const baseData = {
      dwarka: { currentVisitors: 36500 },
      ambaji: { currentVisitors: 18500 },
      somnath: { currentVisitors: 28000 }
    };
    
    return baseData[templeId as keyof typeof baseData] || baseData.dwarka;
  }

  private getTempleCapacity(templeId: string): number {
    const capacities = {
      dwarka: 50000,
      ambaji: 30000,
      somnath: 40000
    };
    
    return capacities[templeId as keyof typeof capacities] || 50000;
  }

  private generateRandomAlert(templeId: string): Alert {
    const alertTypes = [
      { type: 'medical' as const, messages: ['Medical emergency at East Gate', 'First aid required at North Entrance', 'Dehydration case reported'] },
      { type: 'crowd' as const, messages: ['Crowd surge near Entry 3', 'Queue spillover detected', 'High density area identified'] },
      { type: 'security' as const, messages: ['Security check required', 'Suspicious activity reported', 'Bag check station busy'] },
      { type: 'maintenance' as const, messages: ['Barricade repair needed', 'Lighting issue reported', 'Sound system check required'] }
    ];

    const selectedType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const message = selectedType.messages[Math.floor(Math.random() * selectedType.messages.length)];
    const severities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: selectedType.type,
      message,
      severity: severities[Math.floor(Math.random() * severities.length)],
      timestamp: new Date().toISOString()
    };
  }

  private sendTempleUpdate(templeId: string, clientId: string) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    const update = this.generateTempleUpdate(templeId);
    client.ws.send(JSON.stringify(update));
  }

  private broadcastTempleUpdate(templeId: string) {
    const update = this.generateTempleUpdate(templeId);
    const message = JSON.stringify(update);

    // Send to all clients subscribed to this temple
    this.clients.forEach((client) => {
      if (client.templeId === templeId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  private simulateCrowdSurge(templeId: string) {
    console.log(`🚨 Simulating crowd surge for temple: ${templeId}`);
    
    const capacity = this.getTempleCapacity(templeId);
    const surgeUpdate: TempleUpdate = {
      type: 'status_update',
      templeId,
      timestamp: new Date().toISOString(),
      currentVisitors: Math.round(capacity * 0.9), // 90% capacity
      queueLength: Math.round(capacity * 0.15), // 15% in queue
      occupancyPercent: 90,
      avgWaitTime: 75,
      alerts: [{
        id: `surge-${Date.now()}`,
        type: 'crowd',
        message: 'CROWD SURGE DETECTED - Emergency protocols activated',
        severity: 'high',
        timestamp: new Date().toISOString()
      }]
    };

    // Broadcast surge to all clients of this temple
    const message = JSON.stringify(surgeUpdate);
    this.clients.forEach((client) => {
      if (client.templeId === templeId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public method to trigger surge from API
  public triggerSurge(templeId: string) {
    this.simulateCrowdSurge(templeId);
  }

  // Get connected clients count
  public getConnectedClientsCount(templeId?: string): number {
    if (templeId) {
      return Array.from(this.clients.values())
        .filter(client => client.templeId === templeId).length;
    }
    return this.clients.size;
  }
}

export { TempleWebSocketManager, type TempleUpdate, type Alert };