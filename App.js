import React from 'react';
import { Button, View } from 'react-native';
// Import the specific function you need from your config file
import { functions } from './firebaseConfig.js';
import { httpsCallable } from 'firebase/functions';

export default function App() {
  const callMyFunction = () => {
    const updateUserLocation = httpsCallable(functions, 'updateUserLocation');
    updateUserLocation({ latitude: 40.42, longitude: -86.91 })
      .then(result => console.log(result.data));
  };

  return (
    <View>
      <Button title="Call Cloud Function" onPress={callMyFunction} />
    </View>
  );
}