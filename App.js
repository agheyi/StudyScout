import React, { useState } from 'react';
import { StyleSheet, Text, Button, View, Image, TouchableOpacity, ScrollView } from 'react-native';


// These imports are for Firebase and are now included in this single file.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";


// The Firebase configuration is now set with empty strings
// The app will run, but the Firebase calls will not work until you
// replace these with your actual project credentials.
const firebaseConfig = {
 apiKey: "",
 authDomain: "",
 projectId: "",
 storageBucket: "",
 messagingSenderId: "",
 appId: ""
};


// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const functions = getFunctions(app);


// Mock data for building occupancy and locations
const BUILDING_DATA = [
 { id: '1', name: 'WALC', occupancy: 0.1, isFunctional: true, location: { latitude: 40.427627844398195, longitude: -86.91312700795571 } },
 { id: '2', name: 'Co-Rec', occupancy: 0.2, isFunctional: false, location: { latitude: 40.42837234316712, longitude: -86.92228050170229 } },
 { id: '3', name: 'Krach', occupancy: 0.5, isFunctional: false, location: { latitude: 40.42770007619064, longitude: -86.92119737471492 } },
 { id: '4', name: 'DSAI', occupancy: 0.65, isFunctional: false, location: { latitude: 40.429194978141574, longitude: -86.91487983423372 } },
 { id: '5', name: 'Hicks', occupancy: 0.8, isFunctional: false, location: { latitude: 40.42472895718729, longitude: -86.91255983053797 } },
 { id: '6', name: 'WTHR', occupancy: 0.95, isFunctional: false, location: { latitude: 40.42661749484793, longitude: -86.91302332565841 } },
];

const userLocation = {
  latitude: 40.42837234316712, 
  longitude: -86.92228050170229
};

const WALC_HOURS = [
  'Monday: 7:00 AM - 12:00 AM',
  'Tuesday: 7:00 AM - 12:00 AM',
  'Wednesday: 7:00 AM - 12:00 AM',
  'Thursday: 7:00 AM - 12:00 AM',
  'Friday: 7:00 AM - 12:00 AM',
  'Saturday: 8:00 AM - 12:00 AM',
  'Sunday: 8:00 AM - 12:00 AM',
  'Monday (Next Week): 7:00 AM - 12:00 AM',
  'Tuesday (Next Week): 7:00 AM - 12:00 AM',
  'Wednesday (Next Week): 7:00 AM - 12:00 AM',
  'Thursday (Next Week): 7:00 AM - 12:00 AM',
  'Friday (Next Week): 7:00 AM - 12:00 AM',
  'Saturday (Next Week): 8:00 AM - 12:00 AM',
  'Sunday (Next Week): 8:00 AM - 12:00 AM',
  'Monday (Week 3): 7:00 AM - 12:00 AM',
  'Tuesday (Week 3): 7:00 AM - 12:00 AM',
  'Wednesday (Week 3): 7:00 AM - 12:00 AM',
  'Thursday (Week 3): 7:00 AM - 12:00 AM',
  'Friday (Week 3): 7:00 AM - 12:00 AM',
];

// Helper function to get a Purdue-themed color from black to gold
const getColorForOccupancy = (occupancy) => {
 const gold = { r: 206, g: 184, b: 136 }; // #CEB888
 const black = { r: 0, g: 0, b: 0 };    // #000000
 // Linearly interpolate between black and gold based on occupancy
 const r = Math.floor(black.r + (gold.r - black.r) * occupancy);
 const g = Math.floor(black.g + (gold.g - black.g) * occupancy);
 const b = Math.floor(black.b + (gold.b - black.b) * occupancy);
 return `rgb(${r},${g},${b})`;
};

// Find distance function
const findDistance = (loc1, loc2) => {
  const R = 3958.8;
  const toRad = (value) => (value * Math.PI) / 180;
  const lat1 = toRad(loc1.latitude);
  const lon1 = toRad(loc1.longitude);
  const lat2 = toRad(loc2.latitude);
  const lon2 = toRad(loc2.longitude);
  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Add distance to the building data and sort them by occupancy
const buildingsWithDistance = BUILDING_DATA.map(building => ({
  ...building,
  distance: findDistance(userLocation, building.location),
}));

const sortedBuildings = [...buildingsWithDistance].sort((a, b) => a.occupancy - b.occupancy);

export default function App() {
  const [currentPage, setCurrentPage] = useState('studySpaces');
  const [showDistances, setShowDistances] = useState(false); // New state variable


  const callMyFunction = () => {
    console.log("Button pressed!");
    const updateUserLocation = httpsCallable(functions, 'updateUserLocation');
    // Note: This userLocation is hardcoded for now, you would get it from a GPS API
    const userLocationToSend = { latitude: 40.4237, longitude: -86.9212 };
    updateUserLocation(userLocationToSend)
      .then((result) => {
        console.log("SUCCESS: The function returned:", result.data);
      })
      .catch((error) => {
        console.error("ERROR calling function:", error);
      });
      // Set the state to true to show the distances
      setShowDistances(true);
  };


 // This function renders the first screen (now deprecated in favor of the new button)
 const renderCallFunctionPage = () => (
  <View style={styles.initialContainer}>
    <Button
      title="Call Cloud Function"
      onPress={() => setCurrentPage('studySpaces')}
    />
  </View>
);


 // This function renders the second screen with the study spaces
 const renderStudySpacesPage = () => (
   <View style={styles.studySpacesContainer}>
     <Text style={styles.heading}>Study Spaces</Text>
     <View style={styles.buttonContainer}>
       {sortedBuildings.map(building => (
         <View
           key={building.id}
           style={[
             styles.buildingButtonWrapper,
             { backgroundColor: getColorForOccupancy(building.occupancy) }
           ]}
         >
           <Button
             title={building.name}
             onPress={() => {
               if (building.isFunctional) {
                 setCurrentPage('walcDetails');
               } else {
                 console.log(`${building.name} button clicked (not yet functional).`);
               }
             }}
             color={building.occupancy > 0.5 ? '#000' : '#fff'} // Set button text color to white for contrast
           />
           {/* Conditionally render the distance */}
           {showDistances && (
             <Text style={styles.distanceText}>
               {building.distance.toFixed(1)} mi
             </Text>
           )}
         </View>
       ))}
     </View>
     {/* The new button to call the function */}
     <TouchableOpacity
       style={styles.callFunctionButton}
       onPress={callMyFunction}
     >
       <Text style={styles.buttonText}>Call Cloud Function</Text>
     </TouchableOpacity>
     <Text style={styles.currentLocationText}>
       Current Location: {userLocation.latitude}, {userLocation.longitude}
     </Text>
   </View>
 );


 // This function renders the new WALC details page
 const renderWalcPage = () => (
   <View style={styles.walcContainer}>
     <Text style={styles.walcText}>WALC</Text>
     <Image
       style={styles.walcImage} 
       source={
         require('/Users/anwikagheyi/StudyScout/IMG_5154.jpeg')
       }
     />
     <ScrollView style={styles.scrollContent}>
        {WALC_HOURS.map((time, index) => (
          <Text key={index} style={styles.timeText}>
            {time}
          </Text>
        ))}
      </ScrollView>
     <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentPage('studySpaces')}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
   </View>
 );


 // Conditional rendering to display the correct page
 if (currentPage === 'studySpaces') {
   return renderStudySpacesPage();
 } else if (currentPage === 'walcDetails') {
   return renderWalcPage();
 }
}


const styles = StyleSheet.create({
 initialContainer: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
 },
 studySpacesContainer: {
   flex: 1,
   paddingTop: 70, // Increased to move the content down
   justifyContent: 'flex-start',
   alignItems: 'center',
   backgroundColor: '#f4e5c2',
 },
 heading: {
   fontSize: 42,
   fontWeight: 'bold',
   color: '#000',
   marginBottom: 60, // Increased to add space between heading and buttons
   fontFamily: 'AvenirNext-Bold',
 },
 buttonContainer: {
   width: '90%',
   paddingHorizontal: 20,
 },
 buildingButtonWrapper: {
   borderRadius: 10,
   overflow: 'hidden',
   marginBottom: 15,
   paddingVertical: 10,
   flexDirection: 'row', // Align children (button and text) in a row
   alignItems: 'center', // Center them vertically
   justifyContent: 'space-between', // Push children to opposite ends
 },
 buildingImage: {
  width: '100%',
  height: 150,
  marginBottom: 10,
  borderRadius: 5,
 },
 walcContainer: {
   flex: 1,
   justifyContent: 'flex-start',
   alignItems: 'center',
   backgroundColor: '#f4e5c2',
   paddingTop: 70,
 },
 walcText: {
   fontSize: 42,
   fontWeight: 'bold',
   color: '#000',
   marginBottom: 30, // Increased to add space between heading and buttons
   fontFamily: 'AvenirNext-Bold',
 },
 walcImage: {
   width: 320,
   height: 213.333,
   resizeMode: 'contain',
   borderRadius: 15,
 },
backButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
  },
  scrollContent: {
    flex: 1,
    marginTop: 25,
    marginBottom: 100,
    width: 320,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backArrow: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 5,
  },
  backText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentLocationText: {
    position: 'absolute',
    bottom: 30,
    fontSize: 14,
    color: '#000',
    fontFamily: 'AvenirNext-Regular',
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  distanceText: {
    color: '#fff', // White color for contrast on the dark button background
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'AvenirNext-Regular',
    paddingRight: 15, // Add some padding to the right of the text
  },
  callFunctionButton: {
    width: '90%',
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  }
});