# 🏛️ Dwarka Smart Pilgrimage Management System

A production-ready, scalable temple management system inspired by the sacred Dwarka Temple, featuring real-time crowd monitoring, ML-powered visitor predictions, and intelligent resource management.

## 🌟 Features

### 🎯 Core Capabilities
- **Real-time Crowd Monitoring** - Live visitor tracking with WebSocket updates
- **ML-Powered Predictions** - 24-hour visitor inflow forecasting
- **E-Darshan Booking System** - Digital ticket management with slot availability
- **Smart Alert System** - Automated incident detection and staff dispatch
- **Interactive Dashboard** - Beautiful Dwarka-themed admin interface
- **Staff Management** - Drag-and-drop resource allocation
- **Parking Management** - Real-time parking slot monitoring

### 🏗️ Architecture
- **Frontend**: React + TypeScript + Tailwind CSS (Dwarka-themed)
- **Backend**: Node.js + Express + WebSocket
- **ML Service**: Python + FastAPI + Synthetic ML Models
- **Database**: MongoDB with seeded temple data
- **Infrastructure**: Docker + Docker Compose
- **Real-time**: WebSocket connections for live updates

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for ML development)

### 🎬 Demo Launch
```bash
# Clone and start the complete system
git clone <repository>
cd dwarka-smart-pilgrimage
make demo
```

**That's it!** The system will be available at:
- 📱 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8080
- 🤖 **ML Service**: http://localhost:8000
- 📊 **MongoDB**: mongodb://localhost:27017

### 🎭 Hackathon Demo Flow

1. **Start the System**
   ```bash
   make demo
   ```

2. **Open the Dwarka Landing Page**
   - Visit http://localhost:3000
   - Experience the beautiful Dwarka-themed introduction
   - Click "Open Dashboard" to enter the management system

3. **Real-time Dashboard**
   - Watch live visitor counts updating every 3 seconds
   - See the connection status indicator (green = live)
   - Observe queue lengths and occupancy percentages

4. **ML Predictions**
   - Toggle "Festival Mode Simulation" to see 2x visitor predictions
   - View 24-hour inflow charts with peak hour identification
   - Watch predictions update dynamically

5. **Trigger Crowd Surge**
   ```bash
   make surge
   # OR click the "🚨 Simulate Crowd Surge" button in Admin panel
   ```
   - Occupancy jumps to 90% (red alert)
   - Real-time alerts appear in the dashboard
   - WebSocket pushes immediate updates to all connected clients

6. **Staff Management**
   - Go to Admin panel (http://localhost:3000/admin)
   - Drag and drop staff members to different zones
   - Click "Dispatch Medical" or "Dispatch Police"
   - See action logs update in real-time

7. **E-Darshan Booking**
   - Purchase tickets through the dashboard
   - Select date, time slot, and number of devotees
   - View booking confirmations and ticket history

## 🛠️ Development

### Local Development
```bash
# Install dependencies
make install

# Start individual services
make dev-frontend    # React dev server
make dev-backend     # Express with hot reload
make dev-ml         # FastAPI with auto-reload

# Or start everything with Docker
make up
```

### Available Commands
```bash
make help           # Show all available commands
make build          # Build Docker images
make logs           # View all service logs
make health         # Check service health
make test           # Run tests
make clean          # Clean up Docker resources
make api-test       # Test API endpoints
make notebook       # Start Jupyter notebook
```

## 📡 API Documentation

### Core Endpoints

#### Temples
- `GET /api/temples` - List all temples
- `GET /api/temples/:id` - Get temple details
- `PATCH /api/temples/:id/status` - Update temple status
- `POST /api/temples/:id/simulate/surge` - Trigger crowd surge

#### ML Predictions
- `POST /api/ml/predict` - Get 24-hour visitor predictions
- `GET /api/ml/status/:templeId` - Get current temple status

#### Tickets
- `POST /api/tickets` - Create E-Darshan ticket
- `GET /api/tickets` - List tickets
- `GET /api/tickets/slots/:templeId/:date` - Check slot availability

#### Staff & Alerts
- `GET /api/staff` - List staff members
- `POST /api/staff/dispatch` - Dispatch staff to zones
- `GET /api/alerts` - Get alerts
- `POST /api/alerts` - Create new alert

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:8080/ws?templeId=dwarka');

// Receive real-time updates
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Temple update:', update);
};
```

## 🤖 ML Service

### Prediction Model
The ML service uses a deterministic model that considers:
- **Time of day** (morning/evening peaks)
- **Day of week** (weekend multipliers)
- **Festival mode** (2x visitor surge)
- **Temple capacity** (different for each temple)

### Sample Request/Response
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "templeId": "dwarka",
    "date": "2025-01-20",
    "festivalMode": false
  }'
```

```json
{
  "templeId": "dwarka",
  "date": "2025-01-20",
  "predictions": [
    {"hour": 0, "visitors": 900, "confidence": 0.7},
    {"hour": 1, "visitors": 1200, "confidence": 0.7},
    ...
  ],
  "totalPredicted": 45000,
  "peakHour": 7,
  "peakVisitors": 8500
}
```

### Jupyter Notebook
```bash
make notebook
# Access at http://localhost:8888
```

The notebook includes:
- Synthetic dataset generation
- Visitor pattern analysis
- Model training examples
- Visualization of predictions

## 🗄️ Database Schema

### Collections
- **temples** - Temple information and current status
- **tickets** - E-Darshan bookings
- **alerts** - System alerts and incidents
- **staff** - Staff members and their assignments
- **parking** - Parking zone occupancy

### Sample Data
The system comes pre-seeded with:
- 3 temples (Dwarka, Ambaji, Somnath)
- Sample tickets and bookings
- Staff members (Medical, Police, Volunteers)
- Historical alerts and incidents

## 🐳 Docker Services

### Service Architecture
```yaml
services:
  frontend:    # React app (Nginx)
  backend:     # Node.js + Express + WebSocket
  ml-service:  # Python + FastAPI
  mongo:       # MongoDB with seed data
```

### Health Checks
All services include health check endpoints:
- Backend: `GET /health`
- ML Service: `GET /health`
- MongoDB: Built-in ping

## 🧪 Testing

### API Testing
```bash
# Test all endpoints
make api-test

# Use Postman collection
# Import: postman/Dwarka_Temple_API.postman_collection.json
```

### WebSocket Testing
```bash
# Connect to WebSocket
wscat -c "ws://localhost:8080/ws?templeId=dwarka"

# Send test message
{"type": "ping"}
```

### Load Testing
```bash
# Simulate multiple WebSocket connections
for i in {1..10}; do
  wscat -c "ws://localhost:8080/ws?templeId=dwarka" &
done
```

## 🎨 UI/UX Features

### Dwarka Theme
- **Colors**: Royal blue, gold, cream (inspired by Dwarka Temple)
- **Typography**: Playfair Display for headings, Inter for body
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design with breakpoints

### Real-time Indicators
- **Connection Status**: Green/red dots showing WebSocket connectivity
- **Live Updates**: Smooth number animations for visitor counts
- **Alert Notifications**: Toast messages for critical events
- **Progress Bars**: Visual occupancy and queue indicators

## 🔧 Configuration

### Environment Variables
```bash
# Backend
MONGODB_URI=mongodb://mongo:27017/dwarka_temple
ML_SERVICE_URL=http://ml-service:8000
PORT=8080

# Frontend
REACT_APP_API_URL=http://localhost:8080
REACT_APP_WS_URL=ws://localhost:8080
```

### Customization
- **Temple Data**: Modify `docker/mongo-init/init.js`
- **ML Parameters**: Update `ml-service/main.py`
- **UI Theme**: Edit `client/global.css`
- **WebSocket Frequency**: Change interval in `server/websocket.ts`

## 📈 Monitoring & Analytics

### Metrics Available
- Real-time visitor counts
- Queue lengths and wait times
- Occupancy percentages
- Alert frequencies
- Staff deployment efficiency
- Parking utilization

### Logging
```bash
# View all logs
make logs

# Service-specific logs
make logs-backend
make logs-ml
make logs-frontend
```

## 🚀 Production Deployment

### Docker Compose (Recommended)
```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

### Cloud Deployment
- **AWS**: ECS + RDS + ElastiCache
- **GCP**: Cloud Run + Cloud SQL + Memorystore
- **Azure**: Container Instances + Cosmos DB + Redis

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test: `make test`
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Create Pull Request

### Code Style
- **Frontend**: Prettier + ESLint
- **Backend**: ESLint + TypeScript strict mode
- **Python**: Black + Flake8

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the sacred **Dwarka Temple** in Gujarat, India
- Built for hackathons and educational purposes
- Demonstrates modern full-stack architecture with real-time features
- Showcases ML integration in production systems

---

**🏛️ "Har Har Mahadev" - May this system serve devotees with efficiency and grace**

For support or questions, please open an issue or contact the development team.