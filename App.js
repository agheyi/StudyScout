import React from 'react';
import { StyleSheet, Button } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

// Import your Firebase config and the necessary functions
import { functions } from './firebaseConfig.js';
import { httpsCallable } from 'firebase/functions';

export default function App() {
  // --- Define your function here, inside App() but before return ---
  const callMyFunction = () => {
  console.log("Button pressed!");

  const updateUserLocation = httpsCallable(functions, 'updateUserLocation');

  // 1. Create an object with the location data
  const userLocation = { latitude: 40.4237, longitude: -86.9212 }; // Using Purdue's coordinates for the test

  // 2. IMPORTANT: Pass the 'userLocation' object when you call the function
  updateUserLocation(userLocation)
    .then((result) => {
      console.log("SUCCESS: The function returned:", result.data);
    })
    .catch((error) => {
      console.error("ERROR calling function:", error);
    });
};

  // --- The return statement renders your UI ---
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Button
          title="Call Cloud Function"
          onPress={callMyFunction} // Link the button's press to your function
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// --- Your styles go at the bottom ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});