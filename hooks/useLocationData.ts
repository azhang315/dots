import { LocationObject } from 'expo-location/src/Location.types';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

export default function useLocationData() {
 console.log("...UsingLocationData...")
  const [userLocation, setUserLocation] = useState<LocationObject>({} as LocationObject);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
      (async () => {
          let {status} = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
              setErrorMsg('Permission to access location was denied');
              return;
          }
          let location = await Location.getCurrentPositionAsync({});
          setUserLocation(location);
      }
      )();
  }, []);

  // Location.setGoogleApiKey(apiKey);

  return {userLocation};
}
