
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const publicFolder = path.join(__dirname, "public");

app.disable("x-powered-by");
app.use(express.static(publicFolder));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "dilBrowser" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicFolder, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`dilBrowser is running on port ${PORT}`);
});

