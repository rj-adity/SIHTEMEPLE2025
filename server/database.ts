import { MongoClient, Db, Collection } from 'mongodb';

interface Temple {
  _id: string;
  name: string;
  nameGu: string;
  location: string;
  capacity: number;
  currentVisitors: number;
  queueLength: number;
  avgWaitTime: number;
  occupancyPercent: number;
  status: 'active' | 'maintenance' | 'closed';
  coordinates: { lat: number; lng: number };
  createdAt: Date;
  updatedAt: Date;
}

interface Ticket {
  _id: string;
  templeId: string;
  name: string;
  phone: string;
  email?: string;
  date: string;
  slot: string;
  count: number;
  amount: number;
  status: 'confirmed' | 'cancelled' | 'used';
  createdAt: Date;
}

interface Alert {
  _id?: string;
  templeId: string;
  type: 'medical' | 'crowd' | 'security' | 'maintenance';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  resolved: boolean;
}

interface Staff {
  _id: string;
  name: string;
  type: 'Medical' | 'Police' | 'Volunteer';
  templeId: string;
  zone: string;
  status: 'active' | 'inactive' | 'dispatched';
  contact: string;
}

interface Parking {
  _id?: string;
  templeId: string;
  zone: string;
  used: number;
  total: number;
  updatedAt: Date;
}

class DatabaseManager {
  private client: MongoClient;
  private db: Db;
  private connected: boolean = false;

  constructor(uri: string = 'mongodb://localhost:27017/dwarka_temple') {
    this.client = new MongoClient(uri);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db();
      this.connected = true;
      console.log('📊 Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
      console.log('📊 Disconnected from MongoDB');
    }
  }

  // Temple operations
  async getTemples(): Promise<Temple[]> {
    return this.db.collection<Temple>('temples').find({}).toArray();
  }

  async getTemple(templeId: string): Promise<Temple | null> {
    return this.db.collection<Temple>('temples').findOne({ _id: templeId });
  }

  async updateTempleStatus(templeId: string, updates: Partial<Temple>): Promise<void> {
    await this.db.collection<Temple>('temples').updateOne(
      { _id: templeId },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
  }

  // Ticket operations
  async createTicket(ticket: Omit<Ticket, 'createdAt'>): Promise<Ticket> {
    const newTicket: Ticket = {
      ...ticket,
      createdAt: new Date()
    };
    
    await this.db.collection<Ticket>('tickets').insertOne(newTicket);
    return newTicket;
  }

  async getTickets(templeId?: string, date?: string): Promise<Ticket[]> {
    const filter: any = {};
    if (templeId) filter.templeId = templeId;
    if (date) filter.date = date;
    
    return this.db.collection<Ticket>('tickets')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
  }

  async getTicket(ticketId: string): Promise<Ticket | null> {
    return this.db.collection<Ticket>('tickets').findOne({ _id: ticketId });
  }

  // Alert operations
  async createAlert(alert: Omit<Alert, '_id' | 'timestamp'>): Promise<Alert> {
    const newAlert: Alert = {
      ...alert,
      timestamp: new Date(),
      resolved: false
    };
    
    const result = await this.db.collection<Alert>('alerts').insertOne(newAlert);
    return { ...newAlert, _id: result.insertedId.toString() };
  }

  async getAlerts(templeId?: string, resolved?: boolean): Promise<Alert[]> {
    const filter: any = {};
    if (templeId) filter.templeId = templeId;
    if (resolved !== undefined) filter.resolved = resolved;
    
    return this.db.collection<Alert>('alerts')
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();
  }

  async resolveAlert(alertId: string): Promise<void> {
    await this.db.collection<Alert>('alerts').updateOne(
      { _id: alertId },
      { $set: { resolved: true } }
    );
  }

  // Staff operations
  async getStaff(templeId?: string): Promise<Staff[]> {
    const filter = templeId ? { templeId } : {};
    return this.db.collection<Staff>('staff').find(filter).toArray();
  }

  async updateStaffStatus(staffId: string, status: Staff['status'], zone?: string): Promise<void> {
    const updates: any = { status };
    if (zone) updates.zone = zone;
    
    await this.db.collection<Staff>('staff').updateOne(
      { _id: staffId },
      { $set: updates }
    );
  }

  // Parking operations
  async getParkingStatus(templeId: string): Promise<Parking[]> {
    return this.db.collection<Parking>('parking')
      .find({ templeId })
      .toArray();
  }

  async updateParkingStatus(templeId: string, zone: string, used: number): Promise<void> {
    await this.db.collection<Parking>('parking').updateOne(
      { templeId, zone },
      { 
        $set: { 
          used, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );
  }

  // Analytics operations
  async getVisitorStats(templeId: string, days: number = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.db.collection('visitor_logs').aggregate([
      {
        $match: {
          templeId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            hour: { $hour: "$timestamp" }
          },
          avgVisitors: { $avg: "$visitors" },
          maxVisitors: { $max: "$visitors" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1, "_id.hour": 1 }
      }
    ]).toArray();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.db.admin().ping();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export { 
  DatabaseManager, 
  type Temple, 
  type Ticket, 
  type Alert, 
  type Staff, 
  type Parking 
};