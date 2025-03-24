const UserModel = require("../models/userModel");

// ✅ Create a new user
exports.createUser = async (req, res) => {
  const { email, entry } = req.body;

  // ✅ Validate request data
  if (!email || !entry) {
    console.error("❌ ERROR: Missing email or entry in request body!");
    return res.status(400).json({ error: "Email and entry are required" });
  }

  try {
    console.log(`📩 Incoming Request: POST /api/users - Email: ${email}`);

    // ✅ Ensure function exists before calling
    if (!UserModel.createUser) {
      console.error("❌ ERROR: createUser function is missing in userModel.js!");
      return res.status(500).json({ error: "Internal Server Error - Missing function in model" });
    }

    const newUser = await UserModel.createUser(email, entry);
    console.log("✅ Successfully created user:", newUser.id);

    res.status(201).json(newUser);
  } catch (error) {
    console.error("🔥 ERROR: Failed to create user!", error.message);
    res.status(500).json({ error: "Server error while creating user" });
  }
};

// ✅ Fetch user by ID
exports.getUser = async (req, res) => {
  const { id } = req.params;

  // ✅ Validate user ID format
  if (isNaN(id)) {
    console.error("❌ ERROR: Invalid user ID format!");
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  try {
    console.log(`📩 Incoming Request: GET /api/users/${id}`);

    // ✅ Ensure function exists before calling
    if (!UserModel.getUserById) {
      console.error("❌ ERROR: getUserById function is missing in userModel.js!");
      return res.status(500).json({ error: "Internal Server Error - Missing function in model" });
    }

    const user = await UserModel.getUserById(id);
    
    if (!user) {
      console.error("❌ ERROR: User not found!");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ Successfully retrieved user:", user.id);
    res.json(user);
  } catch (error) {
    console.error("🔥 ERROR: Failed to fetch user!", error.message);
    res.status(500).json({ error: "Server error while fetching user" });
  }
};
