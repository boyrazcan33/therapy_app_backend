require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Debugging Middleware: Logs every request
app.use((req, res, next) => {
  console.log(`📩 Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Check If Routes Load Successfully
try {
  const userRoutes = require("./routes/userRoutes");
  const therapistRoutes = require("./routes/therapistRoutes");
  const matchRoutes = require("./routes/matchRoutes");

  console.log("✅ Debug: Successfully loaded route files!");

  app.use("/api/users", userRoutes);
  app.use("/api/therapists", therapistRoutes);
  app.use("/api/match", matchRoutes);
} catch (error) {
  console.error("❌ ERROR: Route import failed!", error);
  process.exit(1);
}

// ✅ List All Registered Routes
console.log("✅ Debug: Listing all registered routes...");
app._router.stack.forEach((layer) => {
  if (layer.route) {
    console.log(`🔹 Route: ${layer.route.path}`);
  }
});

// ✅ Root API Check
app.get("/", (req, res) => {
  res.send("✅ ONNJOY API is running...");
});

// ✅ Handle Undefined Routes
app.use((req, res) => {
  console.log(`❌ Route Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found" });
});

// ✅ Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
