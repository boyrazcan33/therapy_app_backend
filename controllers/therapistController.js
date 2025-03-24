const TherapistModel = require("../models/therapistModel");

// ✅ Fetch all therapists
exports.getAllTherapists = async (req, res) => {
  try {
    console.log("📩 Incoming Request: GET /api/therapists");

    // ✅ Ensure function exists before calling
    if (!TherapistModel.getAllTherapists) {
      console.error("❌ ERROR: getAllTherapists function is missing in therapistModel.js!");
      return res.status(500).json({ error: "Internal Server Error - Missing function in model" });
    }

    const therapists = await TherapistModel.getAllTherapists();
    console.log("✅ Successfully fetched therapists:", therapists.length);
    
    res.json(therapists);
  } catch (error) {
    console.error("🔥 ERROR: Failed to fetch therapists!", error.message);
    res.status(500).json({ error: "Server error while fetching therapists" });
  }
};
