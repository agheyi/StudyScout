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

  const payload = {
    latitude: 40.4237,
    longitude: -86.9212
  };




  // 2. Log the object right before you send it to be 100% sure it's correct.
  console.log("Sending this payload to the function:", payload.latitude, payload.longitude);

  // 3. Pass the single 'payload' object to the function.
  updateUserLocation(payload)
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