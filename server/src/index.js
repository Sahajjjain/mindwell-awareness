import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import Article from "./models/Article.js";
import { seedArticles } from "./data/seedArticles.js";
import articleRoutes from "./routes/articles.js";
import adminRoutes from "./routes/admin.js";

const app = express();
const port = process.env.PORT || 5000;
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
  console.warn("WARNING: Set JWT_SECRET to a unique random value of at least 24 characters.");
}

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map(s => s.trim()) : "http://localhost:5173"
}));
app.use(express.json({ limit: "100kb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 180, standardHeaders: true, legacyHeaders: false }));
app.use("/api/admin/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "MindWell API" }));
app.use("/api/articles", articleRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((error, req, res, next) => {
  console.error(error);
  if (error.name === "ValidationError") return res.status(400).json({ message: "Please check the article fields." });
  if (error.name === "CastError") return res.status(400).json({ message: "Invalid resource ID." });
  if (error.code === 11000) return res.status(409).json({ message: "An article with that value already exists." });
  res.status(error.status || 500).json({ message: error.status ? error.message : "Something went wrong on the server." });
});

async function bootstrap() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log("Connected to MongoDB.");
      const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
      const password = process.env.ADMIN_PASSWORD || "";
      if (email && password && !(await Admin.exists({ email }))) {
        const passwordHash = await bcrypt.hash(password, 12);
        await Admin.create({ email, passwordHash });
        console.log(`Created initial admin account: ${email}`);
      }
      await Article.collection.createIndex({ title: "text", excerpt: "text", category: "text" });
      if (await Article.countDocuments() === 0) {
        await Article.insertMany(seedArticles);
        console.log("Inserted starter awareness articles.");
      }
    } catch (error) {
      console.error("MongoDB connection/bootstrap failed:", error.message);
      console.warn("Starting API in read-only demo mode. Public pages can use built-in starter articles; admin functions require MongoDB.");
    }
  } else {
    console.warn("MONGODB_URI is not set. Starting in read-only demo mode.");
  }
}

bootstrap().finally(() => {
  app.listen(port, () => console.log(`MindWell API listening on port ${port}`));
});
