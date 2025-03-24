const express = require("express");
const router = express.Router();
const { getAllTherapists } = require("../controllers/therapistController"); 

// ✅ Debugging: Ensure controller function exists
if (!getAllTherapists) {
    console.warn("⚠ WARNING: getAllTherapists function is missing! Check therapistController.js");
}

// ✅ Route to fetch all therapists
router.get("/", (req, res) => {
    console.log("📩 Incoming Request: GET /api/therapists");
    getAllTherapists(req, res);
});

module.exports = router;
