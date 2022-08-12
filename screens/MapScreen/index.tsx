import React from "react";
import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Dimensions } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";

import * as Location from "expo-location";
import { LocationObject } from "expo-location/src/Location.types";

import MapView, { LatLng, Marker } from "react-native-maps";
import MapMarker from "react-native-maps";

import { PROVIDER_GOOGLE } from "react-native-maps";
import useLocationData from "../../hooks/useLocationData";
import { PostContext, UserLocationContext } from "../../lib/context";
import GeoJSON from "geojson";
import IncidentMapId from "../../constants/IncidentMapId";
import Map from "../../components/Map";
import styles from "./styles";
import { DocumentData } from "firebase/firestore";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { MapStackParamList, RootStackParamList } from "../../types";
import PostScreen from "../PostScreen.tsx";

import {
  StackNavigationOptions,
  TransitionPresets,
} from "@react-navigation/stack";
import PostScreenNavigation from "../PostScreen.tsx";
import PostCard from "../PostScreen.tsx";

export default function MapScreenNavigation() {
  return <MapScreenStack />;
}
function MapScreen() {
  const posts = useContext(PostContext);
  console.log(`MAPSCREEN POSTS OBJECTS = ${posts}`);
  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.mapContainer}>
          <View style={styles.mapWrapper}>
            <Map posts={posts} />
          </View>
        </View>
      </View>
    </View>
  );
}

const headerScreenOptions: StackNavigationOptions = {
  headerShown: false,
  headerMode: "float",
  // headerBackImage: ,
};

const presentationOptions: StackNavigationOptions = {
  presentation: "transparentModal",
  // cardStyleInterpolator: forRevealFromBottomAndroid
  ...TransitionPresets.FadeFromBottomAndroid,
  cardShadowEnabled: true,
  cardOverlayEnabled: true,
};
const screenOptions: StackNavigationOptions = {
  ...presentationOptions,
  ...headerScreenOptions,
  animationEnabled: true,
};
const Stack = createStackNavigator<MapStackParamList>();
function MapScreenStack() {
  return (
    <Stack.Navigator initialRouteName="MapScreen" screenOptions={screenOptions}>
      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Group screenOptions={screenOptions}>
        <Stack.Screen
          name="PostScreen"
          component={PostCard}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
