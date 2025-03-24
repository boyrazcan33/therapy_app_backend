const express = require("express");
const router = express.Router();
const { createUser, getUser } = require("../controllers/userController");

// ✅ Debugging: Ensure controller functions exist
if (!createUser || !getUser) {
    console.warn("⚠ WARNING: Some userController functions are missing! Check userController.js");
}

// ✅ Create a new user
router.post("/", (req, res) => {
    console.log("📩 Incoming Request: POST /api/users");
    createUser(req, res);
});

// ✅ Middleware to validate user ID before fetching user details
const validateUserId = (req, res, next) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ error: "Invalid user ID format" });
    }
    next();
};

// ✅ Fetch user by ID
router.get("/:id", validateUserId, (req, res) => {
    console.log(`📩 Incoming Request: GET /api/users/${req.params.id}`);
    getUser(req, res);
});

module.exports = router;
