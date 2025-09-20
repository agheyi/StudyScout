import React, { useState } from 'react';
import { StyleSheet, Text, Button, View } from 'react-native';

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
        <Button
          title="WALC"
          onPress={() => console.log("WALC button clicked!")}
        />
        <Button
          title="Co-Rec"
          onPress={() => console.log("Co-Rec button clicked (not yet functional).")}
        />
        <Button
          title="Krach"
          onPress={() => console.log("Krach button clicked (not yet functional).")}
        />
        <Button
          title="DSAI"
          onPress={() => console.log("DSAI button clicked (not yet functional).")}
        />
      </View>
    </View>
  );

  // Conditional rendering to display the correct page
  if (currentPage === 'callFunction') {
    return renderCallFunctionPage();
  } else if (currentPage === 'studySpaces') {
    return renderStudySpacesPage();
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
    paddingTop: 50,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f4e5c2',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '80%',
    justifyContent: 'space-around',
    height: 200,
  },
});