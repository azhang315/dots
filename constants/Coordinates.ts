import { LatLng, Region } from "react-native-maps";

export const BOSTON: LatLng = { latitude: 42.3601, longitude: -71.0589 };

export const BOSTONREGION: Region = {
  latitude: BOSTON.latitude,
  longitude: BOSTON.longitude,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};