import express from "express";
import Article from "../models/Article.js";
import { seedArticles } from "../data/seedArticles.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { category, q, featured } = req.query;
    if (Article.db.readyState !== 1) {
      let list = seedArticles.filter(a => a.published);
      if (category) list = list.filter(a => a.category.toLowerCase() === String(category).toLowerCase());
      if (featured === "true") list = list.filter(a => a.featured);
      if (q) list = list.filter(a => `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(String(q).toLowerCase()));
      return res.json({ articles: list });
    }
    const filter = { published: true };
    if (category) filter.category = String(category);
    if (featured === "true") filter.featured = true;
    if (q) filter.$text = { $search: String(q).slice(0, 80) };
    const articles = await Article.find(filter).select("-content").sort({ featured: -1, updatedAt: -1 }).limit(50).lean();
    res.json({ articles });
  } catch (error) { next(error); }
});

router.get("/:slug", async (req, res, next) => {
  try {
    if (Article.db.readyState !== 1) {
      const article = seedArticles.find(a => a.slug === req.params.slug && a.published);
      return article ? res.json({ article }) : res.status(404).json({ message: "Article not found." });
    }
    const article = await Article.findOne({ slug: req.params.slug, published: true }).lean();
    return article ? res.json({ article }) : res.status(404).json({ message: "Article not found." });
  } catch (error) { next(error); }
});

export default router;
