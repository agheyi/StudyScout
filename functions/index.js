const functions = require("firebase-functions");
const admin = require("firebase-admin");

//HI JACOB

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

// This is our main, callable function
exports.updateUserLocation = functions.https.onCall(async (data, context) => {
  // Get the user's location from the data sent by the app
  const {latitude, longitude} = data;

  if (!latitude || !longitude) {
    throw new functions.https.HttpsError("invalid-argument", "Missing latitude or longitude.");
  }

  // Get a reference to our Firestore database
  const db = admin.firestore();
  const buildingsRef = db.collection("buildings");

  try {
    const snapshot = await buildingsRef.get();
    let userInsideBuilding = false;

    // Loop through each building to check the user's proximity
    for (const doc of snapshot.docs) {
      const building = doc.data();
      const buildingLat = building.location.latitude;
      const buildingLon = building.location.longitude;

      // Calculate the distance
      const distance = getDistanceInMeters(latitude, longitude, buildingLat, buildingLon);

      // If the user is within the building's radius...
      if (distance < building.radius) {
        userInsideBuilding = true;
        // Atomically increment the occupancy count. This is safe for many users at once.
        await doc.ref.update({
          occupancyCount: admin.firestore.FieldValue.increment(1),
        });
        console.log(`User is inside ${building.name}. Incremented count.`);
        // We break the loop because a user can only be in one building at a time
        break;
      }
    }

    return {success: true, insideBuilding: userInsideBuilding};
  } catch (error) {
    console.error("Error updating location:", error);
    throw new functions.https.HttpsError("internal", "Could not process location update.");
  }
});