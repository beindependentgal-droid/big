import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import app from "./api/index";

const DEFAULT_PORT = Number(process.env.PORT || 3000);
const portArgIndex = process.argv.findIndex((arg) => arg === "--port" || arg.startsWith("--port="));
const parsedPortValue = portArgIndex >= 0
  ? Number.parseInt(
      portArgIndex + 1 < process.argv.length
        ? process.argv[portArgIndex + 1]
        : process.argv[portArgIndex].split("=")[1] || "",
      10
    )
  : Number.NaN;
const PORT = Number.isFinite(parsedPortValue) && parsedPortValue > 0
  ? parsedPortValue
  : DEFAULT_PORT;

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

