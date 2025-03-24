const pool = require("../db");

const MatchModel = {
  /**
   * ✅ Store therapist recommendations for a user (Prevent Duplicates)
   */
  async saveMatch(userId, therapistId, matchScore) {
    try {
      // ✅ Check if this match already exists
      const existingMatch = await pool.query(
        "SELECT * FROM matches WHERE user_id = $1 AND therapist_id = $2",
        [userId, therapistId]
      );

      if (existingMatch.rows.length > 0) {
        console.warn(`⚠ WARNING: Match for user ${userId} and therapist ${therapistId} already exists. Skipping insert.`);
        return;
      }

      // ✅ Insert new match
      await pool.query(
        "INSERT INTO matches (user_id, therapist_id, match_score) VALUES ($1, $2, $3)",
        [userId, therapistId, matchScore]
      );

      console.log(`✅ Match saved: User ${userId} → Therapist ${therapistId} (Score: ${matchScore})`);
      
    } catch (error) {
      console.error("❌ ERROR: Failed to save match -", error.message);
      throw error; // Rethrow for controller to handle
    }
  },

  /**
   * ✅ Retrieve stored matches for a user (Returns [] if no matches)
   */
  async getMatchesByUserId(userId) {
    try {
      const result = await pool.query(
        "SELECT matches.therapist_id, therapists.name, matches.match_score " +
        "FROM matches " +
        "JOIN therapists ON matches.therapist_id = therapists.id " +
        "WHERE matches.user_id = $1 ORDER BY matches.match_score DESC",
        [userId]
      );

      console.log(`✅ Retrieved ${result.rows.length} matches for user ${userId}`);
      return result.rows.length > 0 ? result.rows : [];

    } catch (error) {
      console.error("❌ ERROR: Failed to retrieve matches -", error.message);
      throw error; // Rethrow for controller to handle
    }
  }
};

module.exports = MatchModel;
