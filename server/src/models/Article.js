import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  readTime: { type: String, default: "4 min read", maxlength: 30 },
  excerpt: { type: String, required: true, trim: true, maxlength: 220 },
  content: { type: String, required: true, trim: true, maxlength: 12000 },
  published: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  sourceLabel: { type: String, default: "", trim: true, maxlength: 120 },
  sourceUrl: { type: String, default: "", trim: true, maxlength: 500 }
}, { timestamps: true });

export default mongoose.model("Article", articleSchema);
