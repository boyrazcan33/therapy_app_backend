const { OpenAI } = require("openai");
const pool = require("../db");
const MatchModel = require("../models/matchModel");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * ✅ Match user with therapists using OpenAI embeddings
 */
exports.matchTherapists = async (req, res) => {
  const { user_id } = req.body;

  try {
    console.log(`🔍 DEBUG: Matching request received for user ID: ${user_id}`);

    // ✅ Step 1: Fetch User Entry
    const userResult = await pool.query("SELECT entry FROM users WHERE id = $1", [user_id]);
    if (userResult.rows.length === 0) {
      console.error("❌ ERROR: User not found in database!");
      return res.status(404).json({ error: "User not found" });
    }

    const userText = userResult.rows[0].entry?.trim();
    console.log("✅ DEBUG: Retrieved user text:", userText);

    if (!userText) {
      console.error("❌ ERROR: User entry is empty.");
      return res.status(400).json({ error: "User entry cannot be empty" });
    }

    // ✅ Step 2: Fetch Therapists
    const therapistResults = await pool.query("SELECT id, bio FROM therapists");
    const therapists = therapistResults.rows;

    if (therapists.length === 0) {
      console.error("❌ ERROR: No therapists found.");
      return res.status(404).json({ error: "No therapists available for matching" });
    }
    console.log(`✅ DEBUG: Found ${therapists.length} therapists for matching.`);

    // ✅ Step 3: Generate OpenAI Embedding for User
    let userEmbedding;
    try {
      const userEmbeddingResponse = await openai.embeddings.create({
        input: userText,
        model: "text-embedding-ada-002",
      });

      if (!userEmbeddingResponse?.data?.[0]?.embedding) {
        throw new Error("OpenAI user embedding response is empty.");
      }

      userEmbedding = userEmbeddingResponse.data[0].embedding;
      console.log("✅ DEBUG: User embedding generated successfully.");
    } catch (err) {
      console.error("🔥 ERROR: OpenAI failed to generate user embedding!", err.message);
      return res.status(500).json({ error: "OpenAI user embedding generation failed" });
    }

    // ✅ Step 4: Generate OpenAI Embeddings for Therapists and Calculate Similarity
    const scores = [];
    for (const therapist of therapists) {
      try {
        if (!therapist.bio || therapist.bio.trim() === "") {
          console.warn(`⚠ WARNING: Skipping therapist ${therapist.id} due to empty bio.`);
          continue;
        }

        const therapistEmbeddingResponse = await openai.embeddings.create({
          input: therapist.bio,
          model: "text-embedding-ada-002",
        });

        if (!therapistEmbeddingResponse?.data?.[0]?.embedding) {
          console.warn(`⚠ WARNING: Skipping therapist ${therapist.id} due to empty embedding.`);
          continue;
        }

        const therapistEmbedding = therapistEmbeddingResponse.data[0].embedding;
        const similarity = cosineSimilarity(userEmbedding, therapistEmbedding);
        scores.push({ therapist_id: therapist.id, score: similarity });

      } catch (therapistError) {
        console.error(`❌ ERROR: OpenAI embedding failed for therapist ${therapist.id}`, therapistError.message);
      }
    }

    // ✅ Step 5: Sort and Select Top 2 Matches
    scores.sort((a, b) => b.score - a.score);
    const topMatches = scores.slice(0, 2);

    console.log("✅ DEBUG: Top therapist matches:", topMatches);

    // ✅ Step 6: Store Matches in Database
    for (const match of topMatches) {
      try {
        await MatchModel.saveMatch(user_id, match.therapist_id, match.score);
      } catch (dbError) {
        console.error(`❌ ERROR: Failed to save match for therapist ${match.therapist_id}`, dbError.message);
      }
    }

    res.json({ matches: topMatches });

  } catch (error) {
    console.error("🔥 ERROR: Matching process failed", error.message);
    res.status(500).json({ error: "Server error while matching therapists" });
  }
};

/**
 * ✅ Get stored matches for a user
 */
exports.getUserMatches = async (req, res) => {
  const user_id = Number(req.params.user_id); // ✅ Ensure user_id is a number

  try {
    console.log(`🔍 DEBUG: Fetching matches for user ID: ${user_id}`);

    if (isNaN(user_id)) {
      console.error("❌ ERROR: Invalid user ID format!");
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const result = await pool.query(
      "SELECT therapist_id, score FROM matches WHERE user_id = $1 ORDER BY score DESC LIMIT 2",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No matches found for this user" });
    }

    console.log(`✅ DEBUG: Retrieved ${result.rows.length} matches for user ID: ${user_id}`);
    res.json({ matches: result.rows });

  } catch (error) {
    console.error("🔥 ERROR: Failed to fetch user matches", error.message);
    res.status(500).json({ error: "Server error while fetching user matches" });
  }
};

// ✅ Cosine Similarity Function
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    console.error("❌ ERROR: Invalid embeddings for similarity calculation.");
    return 0;
  }

  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
