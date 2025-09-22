// MongoDB initialization script
db = db.getSiblingDB('dwarka_temple');

// Create temples collection with seed data
db.temples.insertMany([
  {
    _id: "dwarka",
    name: "Dwarka Temple",
    nameGu: "દ્વારકા મંદિર",
    location: "Dwarka, Gujarat",
    capacity: 50000,
    currentVisitors: 36500,
    queueLength: 1250,
    avgWaitTime: 45,
    occupancyPercent: 73,
    status: "active",
    coordinates: { lat: 22.2394, lng: 68.9678 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "ambaji",
    name: "Ambaji Temple",
    nameGu: "અંબાજી મંદિર",
    location: "Ambaji, Gujarat",
    capacity: 30000,
    currentVisitors: 18500,
    queueLength: 850,
    avgWaitTime: 35,
    occupancyPercent: 62,
    status: "active",
    coordinates: { lat: 24.2167, lng: 72.8667 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "somnath",
    name: "Somnath Temple",
    nameGu: "સોમનાથ મંદિર",
    location: "Somnath, Gujarat",
    capacity: 40000,
    currentVisitors: 28000,
    queueLength: 950,
    avgWaitTime: 40,
    occupancyPercent: 70,
    status: "active",
    coordinates: { lat: 20.8880, lng: 70.4017 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create tickets collection
db.tickets.createIndex({ "templeId": 1, "date": 1, "slot": 1 });
db.tickets.insertMany([
  {
    _id: "DWK-001",
    templeId: "dwarka",
    name: "Rajesh Patel",
    phone: "9876543210",
    email: "rajesh@example.com",
    date: "2025-01-20",
    slot: "06:00–08:00",
    count: 4,
    amount: 400,
    status: "confirmed",
    createdAt: new Date()
  },
  {
    _id: "DWK-002",
    templeId: "dwarka",
    name: "Priya Shah",
    phone: "9876543211",
    date: "2025-01-20",
    slot: "08:00–10:00",
    count: 2,
    amount: 200,
    status: "confirmed",
    createdAt: new Date()
  }
]);

// Create alerts collection
db.alerts.createIndex({ "templeId": 1, "timestamp": -1 });
db.alerts.insertMany([
  {
    templeId: "dwarka",
    type: "medical",
    message: "Medical emergency at East Gate",
    severity: "high",
    timestamp: new Date(),
    resolved: false
  },
  {
    templeId: "dwarka",
    type: "crowd",
    message: "Crowd surge near Entry 3",
    severity: "medium",
    timestamp: new Date(),
    resolved: false
  }
]);

// Create staff collection
db.staff.insertMany([
  {
    _id: "m1",
    name: "Dr. Amit Kumar",
    type: "Medical",
    templeId: "dwarka",
    zone: "North Gate",
    status: "active",
    contact: "9876543220"
  },
  {
    _id: "p1",
    name: "Inspector Ravi Singh",
    type: "Police",
    templeId: "dwarka",
    zone: "West Gate",
    status: "active",
    contact: "9876543221"
  },
  {
    _id: "v1",
    name: "Volunteer Meera",
    type: "Volunteer",
    templeId: "dwarka",
    zone: "East Gate",
    status: "active",
    contact: "9876543222"
  }
]);

// Create parking collection
db.parking.insertMany([
  {
    templeId: "dwarka",
    zone: "North",
    used: 180,
    total: 300,
    updatedAt: new Date()
  },
  {
    templeId: "dwarka",
    zone: "South",
    used: 240,
    total: 300,
    updatedAt: new Date()
  },
  {
    templeId: "dwarka",
    zone: "East",
    used: 280,
    total: 300,
    updatedAt: new Date()
  },
  {
    templeId: "dwarka",
    zone: "West",
    used: 120,
    total: 300,
    updatedAt: new Date()
  }
]);

print("Database initialized with seed data for Dwarka Smart Pilgrimage System");