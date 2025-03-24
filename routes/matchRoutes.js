const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController"); 

// ✅ Debugging: Ensure matchController functions exist
if (!matchController.matchTherapists || !matchController.getUserMatches) {
    console.warn("⚠ WARNING: Some matchController functions are missing! Check matchController.js");
}

// ✅ Route to generate and store therapist matches
router.post("/", matchController.matchTherapists);

// ✅ Middleware to validate user_id format before calling getUserMatches
const validateUserId = (req, res, next) => {
    if (isNaN(req.params.user_id)) {
        return res.status(400).json({ error: "Invalid user ID format" });
    }
    next();
};

// ✅ Route to retrieve stored matches for a user
router.get("/:user_id", validateUserId, matchController.getUserMatches);

module.exports = router;
