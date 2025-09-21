const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Helper function to calculate distance between two GPS coordinates
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const deltaP = p2 - p1;
  const deltaLon = lon2 - lon1;
  const deltaLambda = (deltaLon * Math.PI) / 180;
  const a = Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // returns distance in meters
}

const cors = require("cors")({ origin: true });

exports.updateUserLocation = functions.https.onRequest((req, res) => {
  // Use the CORS middleware to handle security headers
  cors(req, res, async () => {
    try {
      // Data now comes from the request body, not a 'data' parameter
      const { location } = req.body;
      console.log("Function received location string:", location);

      if (!location || typeof location !== 'string') {
        // Manually send back an error response
        return res.status(400).send({ error: "Location string not provided." });
      }

      const [latitude, longitude] = location.split(',').map(Number);

      // --- Your existing logic to find and update the building ---
      // const db = admin.firestore();
      // ... etc.

      // Manually send back a success response
      return res.status(200).send({ success: true, message: "Location processed." });

    } catch (error) {
      console.error("Internal server error:", error);
      return res.status(500).send({ error: "An unexpected error occurred." });
    }
  });
});