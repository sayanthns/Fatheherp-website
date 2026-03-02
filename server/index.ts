import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./api"; // Add this line

// Advanced Error Boundaries: Prevent Node.js process from crashing
process.on("uncaughtException", (error) => {
  console.error("CRITICAL: Uncaught Exception caught by global error boundary:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json()); // Ensure body parsing is enabled
  app.use("/api", apiRouter); // Mount the API router

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // Global Error Handler for Malformed URIs (e.g., /%c0)
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof URIError) {
      console.warn("Caught URIError:", err.message);
      return res.status(400).send("Bad Request: Malformed URI");
    }
    next(err);
  });

  const port = process.env.PORT || 5050;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
