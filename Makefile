# Dwarka Smart Pilgrimage System - Development Commands

.PHONY: help demo build up down logs clean test

help: ## Show this help message
	@echo "Dwarka Smart Pilgrimage System - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$\' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

demo: ## Start the complete demo system
	@echo "🚀 Starting Dwarka Smart Pilgrimage System Demo..."
	docker-compose up --build -d
	@echo ""
	@echo "✅ Demo system is starting up!"
	@echo ""
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔧 Backend API: http://localhost:8080"
	@echo "🤖 ML Service: http://localhost:8000"
	@echo "📊 MongoDB: mongodb://localhost:27017"
	@echo ""
	@echo "🔌 WebSocket: ws://localhost:8080/ws?templeId=dwarka"
	@echo ""
	@echo "⏳ Please wait 30-60 seconds for all services to be ready..."
	@echo "📖 Check logs with: make logs"

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## Show logs from all services
	docker-compose logs -f

logs-backend: ## Show backend logs only
	docker-compose logs -f backend

logs-ml: ## Show ML service logs only
	docker-compose logs -f ml-service

logs-frontend: ## Show frontend logs only
	docker-compose logs -f frontend

clean: ## Clean up Docker resources
	docker-compose down -v
	docker system prune -f

test: ## Run tests
	@echo "🧪 Running tests..."
	docker-compose exec backend npm test
	docker-compose exec ml-service python -m pytest

health: ## Check health of all services
	@echo "🏥 Checking service health..."
	@echo "Backend:" && curl -s http://localhost:8080/health | jq . || echo "❌ Backend not responding"
	@echo "ML Service:" && curl -s http://localhost:8000/health | jq . || echo "❌ ML Service not responding"
	@echo "MongoDB:" && docker-compose exec mongo mongosh --eval "db.adminCommand('ping')" || echo "❌ MongoDB not responding"

seed: ## Seed database with sample data
	@echo "🌱 Seeding database..."
	docker-compose exec mongo mongosh dwarka_temple /docker-entrypoint-initdb.d/init.js

api-test: ## Test API endpoints
	@echo "🔧 Testing API endpoints..."
	@echo "Ping:" && curl -s http://localhost:8080/api/ping | jq .
	@echo "Temples:" && curl -s http://localhost:8080/api/temples | jq .
	@echo "ML Predict:" && curl -s -X POST http://localhost:8000/predict -H "Content-Type: application/json" -d '{"templeId":"dwarka","date":"2025-01-20"}' | jq .

ws-test: ## Test WebSocket connection
	@echo "🔌 Testing WebSocket connection..."
	@echo "Use a WebSocket client to connect to: ws://localhost:8080/ws?templeId=dwarka"

notebook: ## Start Jupyter notebook for ML development
	docker-compose exec ml-service jupyter notebook --ip=0.0.0.0 --port=8888 --no-browser --allow-root

dev-frontend: ## Start frontend in development mode
	npm run dev

dev-backend: ## Start backend in development mode
	cd server && npm run dev

dev-ml: ## Start ML service in development mode
	cd ml-service && uvicorn main:app --reload --host 0.0.0.0 --port 8000

install: ## Install dependencies
	npm install
	cd ml-service && pip install -r requirements.txt

postman: ## Generate Postman collection
	@echo "📮 Generating Postman collection..."
	@echo "Collection will be available at: ./postman/Dwarka_Temple_API.postman_collection.json"

surge: ## Trigger crowd surge simulation
	@echo "🚨 Triggering crowd surge simulation..."
	curl -X POST http://localhost:8080/api/temples/dwarka/simulate/surge

status: ## Show system status
	@echo "📊 System Status:"
	@echo "=================="
	docker-compose ps
	@echo ""
	@echo "🔗 Service URLs:"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8080"
	@echo "ML Service: http://localhost:8000"
	@echo "MongoDB: mongodb://localhost:27017"