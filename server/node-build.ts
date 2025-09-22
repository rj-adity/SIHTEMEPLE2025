import path from "path";
import { createServer } from "./index";
import * as express from "express";

async function startServer() {
  try {
    const { server, app } = await createServer();
    const port = process.env.PORT || 8080;

    // In production, serve the built SPA files
    const __dirname = import.meta.dirname;
    const distPath = path.join(__dirname, "../spa");

    // Serve static files
    app.use(express.static(distPath));

    // Handle React Router - serve index.html for all non-API routes
    app.get("*", (req, res) => {
      // Don't serve index.html for API routes or WebSocket
      if (req.path.startsWith("/api/") || req.path.startsWith("/health") || req.path.startsWith("/ws")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }

      res.sendFile(path.join(distPath, "index.html"));
    });

    server.listen(port, () => {
      console.log(`🚀 Dwarka Smart Pilgrimage System running on port ${port}`);
      console.log(`📱 Frontend: http://localhost:${port}`);
      console.log(`🔧 API: http://localhost:${port}/api`);
      console.log(`🔌 WebSocket: ws://localhost:${port}/ws`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("🛑 Received SIGTERM, shutting down gracefully");
      await app.locals.db.disconnect();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("🛑 Received SIGINT, shutting down gracefully");
      await app.locals.db.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
