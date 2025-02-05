const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema({
    title: String,
    description: String,
    subject: String,
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
    contentType: { type: String, enum: ["Video", "Article", "PDF"] },
    url: String,
    ratings: [{ userId: mongoose.Schema.Types.ObjectId, rating: Number }],
    reviews: [{ userId: mongoose.Schema.Types.ObjectId, review: String }]
});
module.exports = mongoose.model("Content", ContentSchema);