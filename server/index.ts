import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { DatabaseManager } from "./database";
import { TempleWebSocketManager } from "./websocket";
import { handleDemo } from "./routes/demo";
import { templeRoutes } from "./routes/temples";
import { ticketRoutes } from "./routes/tickets";
import { alertRoutes } from "./routes/alerts";
import { staffRoutes } from "./routes/staff";
import { mlRoutes } from "./routes/ml";

export function createExpressApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", async (req, res) => {
    try {
      const dbHealth = await req.app.locals.db.healthCheck();
      res.json({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        database: dbHealth ? "connected" : "disconnected"
      });
    } catch (error) {
      res.status(503).json({ 
        status: "unhealthy", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // API Routes
  app.use("/api/temples", templeRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/alerts", alertRoutes);
  app.use("/api/staff", staffRoutes);
  app.use("/api/ml", mlRoutes);

  return app;
}

export async function createServer() {
  // Initialize database
  const db = new DatabaseManager(process.env.MONGODB_URI);
  await db.connect();

  // Create Express app
  const app = createExpressApp();
  app.locals.db = db;

  // Create HTTP server
  const server = createServer(app);

  // Initialize WebSocket manager
  const wsManager = new TempleWebSocketManager(server);
  app.locals.wsManager = wsManager;

  return { server, app, db, wsManager };
}
