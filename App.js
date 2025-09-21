import React, { useState } from 'react';
import { StyleSheet, Text, Button, View, Image } from 'react-native';


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


// Mock data for building occupancy to control button colors and order
const BUILDING_DATA = [
 { id: '1', name: 'WALC', occupancy: 0.1, isFunctional: true },
 { id: '2', name: 'Co-Rec', occupancy: 0.2, isFunctional: false },
 { id: '3', name: 'Krach', occupancy: 0.5, isFunctional: false },
 { id: '4', name: 'DSAI', occupancy: 0.65, isFunctional: false },
 { id: '5', name: 'Hicks', occupancy: 0.8, isFunctional: false },
 { id: '6', name: 'WTHR', occupancy: 0.95, isFunctional: false },
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


// Sort buildings from least busy (black) to most busy (gold)
const sortedBuildings = [...BUILDING_DATA].sort((a, b) => a.occupancy - b.occupancy);


export default function App() {
 // Use state to manage which "page" is currently displayed
 const [currentPage, setCurrentPage] = useState('callFunction');


 const callMyFunction = () => {
   console.log("Button pressed!");
   const updateUserLocation = httpsCallable(functions, 'updateUserLocation');
   const userLocation = { latitude: 40.4237, longitude: -86.9212 };
   updateUserLocation(userLocation)
     .then((result) => {
       console.log("SUCCESS: The function returned:", result.data);
     })
     .catch((error) => {
       console.error("ERROR calling function:", error);
     });
   // After calling the function, change the page to the study spaces screen
   setCurrentPage('studySpaces');
 };


 // This function renders the first screen
 const renderCallFunctionPage = () => (
   <View style={styles.initialContainer}>
     <Button
       title="Call Cloud Function"
       onPress={callMyFunction}
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
         </View>
       ))}
     </View>
   </View>
 );


 // This function renders the new WALC details page
 const renderWalcPage = () => (
   <View style={styles.walcContainer}>
     <Text style={styles.walcText}>Hi</Text>
     <Image
       style={styles.walcImage}
       source={{
         uri: 'https://placehold.co/400x300/f4e5c2/000?text=WALC+Building',
       }}
     />
     <Button
       title="Back"
       onPress={() => setCurrentPage('studySpaces')}
     />
   </View>
 );


 // Conditional rendering to display the correct page
 if (currentPage === 'callFunction') {
   return renderCallFunctionPage();
 } else if (currentPage === 'studySpaces') {
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
 },
 walcContainer: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   backgroundColor: '#f4e5c2',
 },
 walcText: {
   fontSize: 60,
   fontWeight: 'bold',
   color: '#000',
 },
 walcImage: {
   width: 300,
   height: 200,
   resizeMode: 'contain',
   borderRadius: 10,
 },
});
