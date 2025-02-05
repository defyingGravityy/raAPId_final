const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Content" }],
    progress: [{ contentId: mongoose.Schema.Types.ObjectId, completed: Boolean }]
});

module.exports = mongoose.model("User", UserSchema);

