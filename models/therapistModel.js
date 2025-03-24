const pool = require("../db");

const TherapistModel = {
  /**
   * ✅ Get all therapists (with error handling & sorting)
   */
  async getAllTherapists() {
    try {
      console.log("🔍 DEBUG: Fetching all therapists...");

      const result = await pool.query(
        "SELECT id, name, bio FROM therapists ORDER BY id ASC"
      );

      console.log(`✅ Retrieved ${result.rows.length} therapists from the database.`);
      return result.rows.length > 0 ? result.rows : [];

    } catch (error) {
      console.error("❌ ERROR: Failed to fetch therapists -", error.message);
      throw error; // Rethrow to be handled in controller
    }
  }
};

module.exports = TherapistModel;
