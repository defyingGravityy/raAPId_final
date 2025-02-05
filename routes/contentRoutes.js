const express = require("express");
const Content = require("../models/Content");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Add Educational Content
router.post("/", async (req, res) => {
    const content = new Content(req.body);
    await content.save();
    res.status(201).json(content);
});

// Get All Content
router.get("/", async (req, res) => {
    const content = await Content.find();
    res.json(content);
});

// Update Content
router.put("/:id", async (req, res) => {
    const content = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(content);
});

// Delete Content
router.delete("/:id", async (req, res) => {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: "Content deleted" });
});

// Bookmark Content
router.post("/bookmark/:id", authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.userId);
    user.bookmarks.push(req.params.id);
    await user.save();
    res.json({ message: "Content bookmarked" });
});

// Rate & Review Content
router.post("/rate/:id", authMiddleware, async (req, res) => {
    const { rating, review } = req.body;
    const content = await Content.findById(req.params.id);
    
    content.ratings.push({ userId: req.user.userId, rating });
    content.reviews.push({ userId: req.user.userId, review });

    await content.save();
    res.json({ message: "Review added" });
});

module.exports = router;
