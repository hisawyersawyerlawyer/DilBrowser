
import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createBareServer from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer();
const bare = createBareServer("/bare/");
const publicPath = path.join(__dirname, "public");

// Allow the proxy service worker to control pages
// across the site.
app.use("/uv", (req, res, next) => {
  if (req.path === "/uv.sw.js") {
    res.setHeader("Service-Worker-Allowed", "/");
  }
  next();
});

// Serve the proxy engine's browser files.
app.use("/uv/", express.static(uvPath));

// Serve dilBrowser's HTML, CSS and other public files.
app.use(express.static(publicPath));

// Basic health check for Render.
app.get("/health", (req, res) => {
  res.status(200).send("dilBrowser server is running");
});

// Route proxy traffic to the Bare server.
server.on("request", (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

const port = Number(process.env.PORT || 10000);

server.listen(port, "0.0.0.0", () => {
  console.log(`dilBrowser is listening on port ${port}`);
});
