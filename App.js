import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFunctions } from "firebase/functions";


// The Firebase configuration is now set with empty strings
// The app will run, but the Firebase calls will not work until you
// replace these with your actual project credentials.
const firebaseConfig = {
apiKey: "AIzaSyBXd-E_aBnMwerpvU8V-OYR7-jJ9N2LfJ0",
authDomain: "studyscout-a8343.firebaseapp.com",
projectId: "studyscout-a8343",
storageBucket: "studyscout-a8343.firebasestorage.app",
messagingSenderId: "388650542735",
appId: "1:388650542735:web:d74e1889b9e681cee032fa",
measurementId: "G-DFRDYZWE7G"
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




// Helper function to get a Purdue-themed color from black to gold
const getColorForOccupancy = (occupancy) => {
 const gold = { r: 206, g: 184, b: 136 };
 const black = { r: 0, g: 0, b: 0 };
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


export default function App() {
 const [currentPage, setCurrentPage] = useState('studySpaces');
 const [userLocation, setUserLocation] = useState(null);
 const [errorMsg, setErrorMsg] = useState(null);
 const [showDistances, setShowDistances] = useState(false);
 let [walcFreeSpace, setWalcFreeSpace] = useState(0);


 // Simplified back button logic
 const goBack = () => {
   if (currentPage === 'sundayDetails') {
     setCurrentPage('walcDetails');
   } else if (currentPage === 'walcDetails') {
     setCurrentPage('studySpaces');
   }
 };
  // This function sends the location to your server using a standard fetch call
 const sendLocationToServer = (currentLocation) => {
   if (!currentLocation) return;
   const functionUrl = "https://us-central1-studyscout-a8343.cloudfunctions.net/updateUserLocation";
  
   // Construct the data object to match your onRequest function
   const locationData = {
       location: {
           latitude: currentLocation.coords.latitude,
           longitude: currentLocation.coords.longitude
       }
   };
  
   fetch(functionUrl, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify(locationData),
   })
   .then(response => response.json())
   .then(data => {
     console.log("SUCCESS: Server returned:", data);
   })
   .catch((error) => {
     console.error("ERROR calling function:", error);
   });
 };


 useEffect(() => {
   (async () => {
     let { status } = await Location.requestForegroundPermissionsAsync();
     if (status !== 'granted') {
       setErrorMsg('Permission to access location was denied');
       return;
     }
     Location.watchPositionAsync({
       accuracy: Location.Accuracy.High,
       timeInterval: 10000,
       distanceInterval: 10,
     }, (newLocation) => {
       setUserLocation(newLocation.coords);
       sendLocationToServer(newLocation);
     });

   })
   ();
   
 }, []);


 const buildingsWithDistance = userLocation ?
   BUILDING_DATA.map(building => ({
     ...building,
     distance: findDistance(userLocation, building.location),
   })) : [];


 const sortedBuildings = [...buildingsWithDistance].sort((a, b) => a.occupancy - b.occupancy);


 const renderStudySpacesPage = () => (
   <View style={styles.studySpacesContainer}>
     <Text style={styles.heading}>Study Spaces</Text>
     <View style={styles.buttonContainer}>
       {userLocation ? (
         sortedBuildings.map(building => (
           <View
             key={building.id}
             style={[
               styles.buildingButtonWrapper,
               { backgroundColor: getColorForOccupancy(building.occupancy) }
             ]}
           >
             <TouchableOpacity
               style={styles.fullButton}
               onPress={() => {
                 if (building.isFunctional) {
                   setCurrentPage('walcDetails');
                 } else {
                   console.log(`${building.name} button clicked (not yet functional).`);
                 }
               }}
             >
               <Text style={[
                 styles.buildingButtonText,
                 { color: building.occupancy > 0.5 ? '#000' : '#fff' }
               ]}>
                 {building.name}
               </Text>
             </TouchableOpacity>
             {userLocation && (
               <Text style={styles.distanceText}>
                 {building.distance.toFixed(1)} mi
               </Text>
             )}
           </View>
         ))
       ) : (
         <Text style={styles.loadingText}>
           {errorMsg ? errorMsg : 'Fetching your location...'}
         </Text>
       )}
     </View>
     {userLocation && (
       <Text style={styles.currentLocationText}>
         Current Location: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
       </Text>
     )}
   </View>
 );


 const renderWalcPage = () => {
   // Determine the color based on the percentage
   let percentageColor = '#000';
 if (walcFreeSpace <= 20) {
   percentageColor = 'red';
 } else if (walcFreeSpace <= 40) {
   percentageColor = 'orange';
 } else if (walcFreeSpace <= 60) {
   percentageColor = 'yellow';
 } else if (walcFreeSpace <= 80) {
   percentageColor = 'lightgreen';
 } else { // 81 to 100
   percentageColor = 'green';
 }
  
   return (
     <View style={styles.walcContainer}>
       <Text style={styles.walcText}>WALC</Text>
       <Image
         style={styles.walcImage}
         source={require('/Users/anwikagheyi/StudyScout/IMG_5154.jpeg')}
       />
       <ScrollView style={styles.scrollContent}>
         {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
           <TouchableOpacity
             key={day}
             style={styles.dayButton}
             onPress={() => {
               if (day === 'Sunday') {
                 setCurrentPage('sundayDetails');
               } else {
                 console.log(`${day} button clicked.`);
               }
             }}
           >
             <Text style={styles.dayButtonText}>{day}</Text>
           </TouchableOpacity>
         ))}
       </ScrollView>
       <View style={styles.backButtonContainer}>
         <TouchableOpacity style={styles.backButton} onPress={goBack}>
           <Text style={styles.backArrow}>←</Text>
           <Text style={styles.backText}>Back</Text>
         </TouchableOpacity>
       </View>
     </View>
   );
 };
  const renderSundayPage = () => (
   <View style={styles.walcContainer}>
     <Text style={styles.walcText}>Sunday</Text>
     <Image
         style={styles.walcImage}
         source={require('/Users/anwikagheyi/StudyScout/IMG_5154.jpeg')}
       />
     <ScrollView style={styles.scrollContent}>
       <View style={styles.sundayPanel}>
         <Text style={styles.percentageText}>
           78%
         </Text>
         <Text style={styles.descriptionText}>
           of study space is free.
         </Text>
         <Text style={styles.infoHeading}>Helpful Facts:</Text>
             <Text style={styles.infoText}>• Open 24/7 during finals week.</Text>
             <Text style={styles.infoText}>• Has over 20 collaboration rooms.</Text>
             <Text style={styles.infoText}>• Home to a branch of the Purdue libraries.</Text>
             <Text style={styles.infoText}>• Contains a cafe and dining options.</Text>
           
       </View>
     </ScrollView>
     <View style={styles.backButtonContainer}>
       <TouchableOpacity style={styles.backButton} onPress={goBack}>
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
 } else if (currentPage === 'sundayDetails') {
     return renderSundayPage();
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
   paddingVertical: 20,
   flexDirection: 'row', // Align children (button and text) in a row
   alignItems: 'center', // Center them vertically
   justifyContent: 'space-between', // Push children to opposite ends
   marginTop: 20,
   borderWidth: 2,
   borderColor: "transparent"
 },
 fullButton: {
   flex: 1,
 },
 buildingButtonText: {
   paddingLeft: 15,
   fontSize: 18,
   fontWeight: 'bold',
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
   },
   dayButton: {
     backgroundColor: 'rgba(0, 0, 0, 0.8)',
     paddingVertical: 10,
     paddingHorizontal: 20,
     borderRadius: 10,
     marginBottom: 10,
     alignItems: 'center',
   },
   dayButtonText: {
     color: '#fff',
     fontSize: 16,
     fontWeight: 'bold',
   },
   sundayPanel: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     minHeight: 300,
     paddingTop: 20,
   },
   percentageText: {
     fontSize: 60,
     fontWeight: 'bold',
     marginBottom: 10,
     color: 'lightgreen'
   },
   descriptionText: {
     fontSize: 18,
     fontStyle: 'italic',
     color: '#000',
     marginBottom: 20,
   },
   infoContainer: {
     alignSelf: 'stretch',
   },
   infoHeading: {
     fontSize: 20,
     fontWeight: 'bold',
     marginBottom: 10,
     color: '#000',
   },
   infoText: {
     fontSize: 16,
     color: '#000',
     marginBottom: 5,
   },
 });
