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


// Mock data for building occupancy to control button colors and order
const BUILDING_DATA = [
 { id: '1', name: 'WALC', occupancy: 0.1, isFunctional: true },
 { id: '2', name: 'Co-Rec', occupancy: 0.2, isFunctional: false },
 { id: '3', name: 'Krach', occupancy: 0.5, isFunctional: false },
 { id: '4', name: 'DSAI', occupancy: 0.65, isFunctional: false },
 { id: '5', name: 'Hicks', occupancy: 0.8, isFunctional: false },
 { id: '6', name: 'WTHR', occupancy: 0.95, isFunctional: false },
];

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
     <Text style={styles.walcText}>WALC</Text>
     <Image
       style={styles.walcImage} 
       source={
         require('/Users/shrreyasethu/StudyScout-6/IMG_5154.jpeg')
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
 },backButtonContainer: {
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
});
