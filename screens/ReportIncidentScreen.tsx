import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';

import * as Location from 'expo-location'
import { LocationObject } from 'expo-location/src/Location.types'

import MapView, { LatLng, Marker } from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import useLocationData from '../hooks/useLocationData';
import { UserLocationContext } from '../lib/context';
import GeoJSON from 'geojson';
import IncidentMapId from '../constants/IncidentMapId';

export default function TabThreeScreen() {
  const {userLocation} = useContext(UserLocationContext);

    const [position, setPosition] = useState<LatLng>({latitude: 0, longitude: 0});

    useEffect(() => {
      if (userLocation) {
        setPosition({
          latitude: userLocation.coords.latitude, 
          longitude: userLocation.coords.longitude,
        })
      }
    }, [userLocation]);

    const handleUpload = () => {
      // Upload to DB
      // 1. current coords
      // 2. author
      // 3. timestamp
      // 4. media?
      // 5. TITLE
      // NOTE: ML classification for crime types based off of headline inputs: (violent crime, petty, vehicle hazard, building hazard, etc..)
    }
  return (
    <View style={styles.container}>
      
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <MapView 
      style={styles.map} 
      customMapStyle={IncidentMapId}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: 42.3601,
        longitude: -71.0589,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,

      }}
      showsUserLocation
      >
                <Marker 
        coordinate={position}
        draggable
        title="Hello Maps" 
        />
        </MapView>
        <View>
          <Text>hello text UplOAD BUTTON TO FIREBASE</Text>
        </View>
      <TouchableOpacity onPress={handleUpload} style={styles.button}>
        <Text style={styles.buttonText}>Upload Incident (from current location)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  map: {
    width: Dimensions.get('window').width,
    height: "40%",
  },
  button: {
    backgroundColor: "#0782F9",
    width: "60%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
