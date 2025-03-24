const pool = require("../db");

const UserModel = {
  /**
   * ✅ Create a new user (Prevents duplicate emails)
   */
  async createUser(email, entry) {
    try {
      console.log(`🔍 DEBUG: Creating new user with email: ${email}`);

      // ✅ Check if user already exists
      const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        console.warn(`⚠ WARNING: User with email ${email} already exists.`);
        return { error: "User already exists" }; // Prevent duplicate users
      }

      // ✅ Insert new user
      const result = await pool.query(
        "INSERT INTO users (email, entry) VALUES ($1, $2) RETURNING *",
        [email, entry]
      );

      console.log("✅ DEBUG: User created successfully:", result.rows[0]);
      return result.rows[0];

    } catch (error) {
      console.error("❌ ERROR: Failed to create user -", error.message);
      throw error; // Rethrow for controller to handle
    }
  },

  /**
   * ✅ Get user by ID (Handles missing users)
   */
  async getUserById(id) {
    try {
      console.log(`🔍 DEBUG: Fetching user with ID: ${id}`);

      const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

      if (result.rows.length === 0) {
        console.warn(`⚠ WARNING: User with ID ${id} not found.`);
        return null; // Return null if user is not found
      }

      console.log("✅ DEBUG: Retrieved user:", result.rows[0]);
      return result.rows[0];

    } catch (error) {
      console.error("❌ ERROR: Failed to fetch user -", error.message);
      throw error; // Rethrow for controller to handle
    }
  }
};

module.exports = UserModel;
