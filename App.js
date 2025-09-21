import React, { useState, useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import * as Location from 'expo-location';

export default function App() {
  // State to store the location object and any errors
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // This function sends the location to your server
  const sendLocationToServer = (currentLocation) => {
    if (!currentLocation) return;

    const functionUrl = "https://us-central1-studyscout-a8343.cloudfunctions.net/updateUserLocation";
    
    // Construct the string from the location object
    const locationString = `${currentLocation.coords.latitude},${currentLocation.coords.longitude}`;

    console.log("Sending location to server:", locationString);

    fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location: locationString }),
    })
    .then(response => response.json())
    .then(data => {
      console.log("SUCCESS: Server returned:", data);
    })
    .catch((error) => {
      console.error("ERROR calling function:", error);
    });
  };

  // This useEffect hook runs once when the app loads
  useEffect(() => {
    (async () => {
      // 1. Ask for permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // 2. Start watching for location changes
      Location.watchPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // Get updates every 10 seconds
        distanceInterval: 10, // Or every 10 meters
      }, (newLocation) => {
        setLocation(newLocation); // Update the state
        sendLocationToServer(newLocation); // Send to your function
      });
    })();
  }, []); // The empty array [] ensures this runs only once

  // This part determines what text to display on the screen
  let text = 'Waiting for location...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Lat: ${location.coords.latitude}, Lon: ${location.coords.longitude}`;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.paragraph}>{text}</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
});