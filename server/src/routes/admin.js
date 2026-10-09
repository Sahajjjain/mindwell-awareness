import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import slugify from "slugify";
import Article from "../models/Article.js";
import Admin from "../models/Admin.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function cleanArticle(body) {
  const fields = ["title", "category", "readTime", "excerpt", "content", "sourceLabel", "sourceUrl"];
  const result = {};
  for (const field of fields) result[field] = typeof body[field] === "string" ? body[field].trim() : "";
  result.published = body.published === true;
  result.featured = body.featured === true;
  if (!result.title || !result.category || !result.excerpt || !result.content) {
    const error = new Error("Title, category, excerpt, and content are required.");
    error.status = 400;
    throw error;
  }
  if (result.sourceUrl && !/^https?:\/\//i.test(result.sourceUrl)) {
    const error = new Error("Source URL must begin with http:// or https://.");
    error.status = 400;
    throw error;
  }
  return result;
}

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    const token = jwt.sign({ role: "admin", email: admin.email }, process.env.JWT_SECRET, {
      subject: admin._id.toString(), expiresIn: process.env.JWT_EXPIRES_IN || "2h"
    });
    res.json({ token, email: admin.email });
  } catch (error) { next(error); }
});

router.use(requireAdmin);

router.get("/articles", async (req, res, next) => {
  try {
    const articles = await Article.find().sort({ updatedAt: -1 }).lean();
    res.json({ articles });
  } catch (error) { next(error); }
});

router.post("/articles", async (req, res, next) => {
  try {
    const data = cleanArticle(req.body);
    const baseSlug = slugify(data.title, { lower: true, strict: true }) || `article-${Date.now()}`;
    let slug = baseSlug, n = 2;
    while (await Article.exists({ slug })) slug = `${baseSlug}-${n++}`;
    const article = await Article.create({ ...data, slug });
    res.status(201).json({ article });
  } catch (error) { next(error); }
});

router.put("/articles/:id", async (req, res, next) => {
  try {
    const data = cleanArticle(req.body);
    const article = await Article.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!article) return res.status(404).json({ message: "Article not found." });
    res.json({ article });
  } catch (error) { next(error); }
});

router.patch("/articles/:id/publish", async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found." });
    article.published = !article.published;
    await article.save();
    res.json({ article });
  } catch (error) { next(error); }
});

router.delete("/articles/:id", async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found." });
    res.json({ message: "Article deleted." });
  } catch (error) { next(error); }
});

export default router;
