import React, {
  ChangeEvent,
  MutableRefObject,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";

import { Text, View } from "../components/Themed";

import MapView, { Callout, LatLng, Marker, Region } from "react-native-maps";
import { PROVIDER_GOOGLE } from "react-native-maps";
import { UserLocationContext } from "../lib/context";
import IncidentMapId from "../constants/IncidentMapId";

import {
  Entypo,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import { debounce, some, throttle, values } from "lodash";

import { Image } from "react-native";
import { DocumentData } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import Geocoder from "react-native-geocoding";

import WarningSign, { DotIcon, MarkerIcon } from "../constants/Svgs";
import { LocationObject } from "expo-location";
import { DotFillIcon } from "@primer/octicons-react";

interface Bounds {
  lat_min: number;
  lat_max: number;
  lng_min: number;
  lng_max: number;
}

export default function Map({
  posts,
  center,
  selectedPost,
  disableUserLocation,
}: {
  posts: DocumentData | undefined;
  center?: Region | undefined;
  selectedPost?: DocumentData | undefined;
  disableUserLocation?: boolean;
}) {
  const navigation = useNavigation();
  // TODO: Keep track of current region and region latitudedelta lngdelta --> showUserLocationButton update
  // AND: use that to keep track of a custom user location icon

  const { userLocation } = useContext(UserLocationContext);

  const mapRef = useRef<null | MapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [incidentRegion, setIncidentRegion] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 2,
    longitudeDelta: 2,
  });
  const [currentRegion, setCurrentRegion] = useState<Region>(incidentRegion);
  const [unfocusAll, setUnfocusAll] = useState(true);
  const [zoomed, setZoomed] = useState(true);
  // const [postsBounds, setPostsBounds] = useState<Bounds>({} as Bounds);
  // const [overlapped, setOverlapped] = useState<boolean[]>([]);
  const [overlappedCount, setOverlappedCount] = useState(0);

  // NOTE: not live location tracking
  useEffect(() => {
    console.log("... Initializing Map Variables ... ");
    let region: Region = {} as Region;
    if (center) {
      region = center;
    } else if (userLocation) {
      region = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 1,
        longitudeDelta: 1,
      };
    }
    setIncidentRegion(region);
    handleRegionChange(region); // FIXME
  }, []);
  const [outOfPan, setOutOfPan] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const eventCount = useRef(0);

  function calculateBounds(e: Region, divisor?: number) {
    let lat_min =
      userLocation.coords.latitude -
      e.latitudeDelta / 2 / (divisor ? divisor : 1);
    let lat_max =
      userLocation.coords.latitude +
      e.latitudeDelta / 2 / (divisor ? divisor : 1);
    let lng_min =
      userLocation.coords.longitude -
      e.longitudeDelta / 2 / (divisor ? divisor : 1);
    let lng_max =
      userLocation.coords.longitude +
      e.longitudeDelta / 2 / (divisor ? divisor : 1);

    return { lat_min, lat_max, lng_min, lng_max };
  }
  function _handleRegionChange(e: Region) {
    eventCount.current++;
    console.log(eventCount.current);
    let lat = e.latitude;
    let lng = e.longitude;

    var { lat_min, lat_max, lng_min, lng_max } = calculateBounds(e);
    if (lat >= lat_min && lat <= lat_max && lng >= lng_min && lng <= lng_max) {
      setOutOfPan(false);
    } else {
      setOutOfPan(true);
    }
    Animated.timing(animatedValue, {
      toValue: outOfPan ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    const d = 15;
    var postBounds = calculateBounds(e, d);
    let count = 0;
    posts?.map((post: DocumentData, i: number) => {
      let postLat = post.coordinates.latitude;
      let postLng = post.coordinates.longitude;
      if (
        postLat >= postBounds.lat_min &&
        postLat <= postBounds.lat_max &&
        postLng >= postBounds.lng_min &&
        postLng <= postBounds.lng_max
      ) {
        let epsilon = 0.0005;
        if (postBounds.lat_max - postBounds.lat_min > epsilon) {
          post["overlapped"] = true;
          count++;
        } else {
          post["overlapped"] = false;
        }
      } else {
        post["overlapped"] = false;
      }
      // TODO: Keep track of which posts are hidden, increment a reffed counter, update image of user icon, make pressable
    });
    setOverlappedCount(count);

    if (e.latitudeDelta < 0.1) {
      setZoomed(true);
    } else {
      setZoomed(false);
    }
    setCurrentRegion(e);
  }
  const handleRegionChange = useCallback(
    throttle((e: Region) => _handleRegionChange(e), 400), // FIXME: 400 is latency
    [outOfPan]
  );

  return (
    <View style={styles.container}>
      <MapView
        onMapReady={() => {
          setIsMapReady(true);
        }}
        ref={mapRef}
        style={styles.map}
        customMapStyle={IncidentMapId}
        provider={PROVIDER_GOOGLE}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        zoomEnabled
        zoomTapEnabled
        zoomControlEnabled={false}
        initialRegion={incidentRegion}
        showsUserLocation={false}
        onRegionChange={handleRegionChange}
        onPress={() => {
          setUnfocusAll(true);
        }}
        onMarkerPress={() => {
          setUnfocusAll(false);
        }}
      >
        {isMapReady &&
          posts &&
          posts.length != 0 &&
          posts.map((post: DocumentData) => (
            <PostMarker
              post={post}
              key={post.postId}
              unfocusAll={unfocusAll}
              zoomed={zoomed}
              // overlapped={overlapped}
              selectedPost={selectedPost}
              isMapReady={isMapReady}
            />
          ))}
        {!disableUserLocation && (
          <UserMarker
            userLocation={userLocation}
            overlappedCount={overlappedCount}
            incidentRegion={incidentRegion}
            mapRef={mapRef}
            isMapReady={isMapReady}
          />
        )}
      </MapView>
      <ShowLocationButton
        mapRef={mapRef}
        animatedValue={animatedValue}
        currentRegion={currentRegion}
        center={center}
      />
    </View>
  );
}
function UserMarker({
  userLocation,
  overlappedCount,
  incidentRegion,
  mapRef,
  isMapReady,
}: {
  userLocation: LocationObject;
  overlappedCount: number;
  incidentRegion: Region;
  mapRef: MutableRefObject<null | MapView>;
  isMapReady: boolean;
}) {
  const handlePress = () => {
    if (overlappedCount == 1) {
      let epsilon = 0.001;
      let zoomedRegion: Region = {
        latitude: incidentRegion.latitude,
        longitude: incidentRegion.longitude,
        latitudeDelta: epsilon,
        longitudeDelta: epsilon,
      };

      mapRef.current?.animateToRegion(zoomedRegion, 1000);
    } else if (overlappedCount > 1) {
      let epsilon = 0.01;
      let zoomedRegion: Region = {
        latitude: incidentRegion.latitude,
        longitude: incidentRegion.longitude,
        latitudeDelta: epsilon,
        longitudeDelta: epsilon,
      };

      mapRef.current?.animateToRegion(zoomedRegion, 1000);
    }
  };
  return (
    <Marker
      tracksViewChanges={Platform.OS === 'ios' ? true : false}
      coordinate={{
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      }}
      draggable={false}
      calloutAnchor={{ x: 0.5, y: 1 }}
      anchor={{ x: 0.5, y: 0.5 }}
      style={{
        backgroundColor: "transparent",
        height: 100,
        width: 100,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={handlePress}
    >
      <View
        style={{
          backgroundColor: "transparent",
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <View
          style={{
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "transparent",
          }}
        >
          <Octicons
            name="dot-fill"
            size={60}
            color="#FF4B04"
            style={{ backgroundColor: "transparent" }}
          />
          <DotIcon />
        </View>
        <Feather
          name="smile"
          size={35}
          color="#000000"
          style={{
            backgroundColor: "transparent",
            zIndex: 1,
            elevation: 20,
          }}
        />
        {overlappedCount > 0 && (
          <View
            style={{
              position: "absolute",
              justifyContent: "center",
              alignItems: "center",
              overflow: "visible",
              top: -5,
              right: -3,
              backgroundColor: "#130F00",
              borderRadius: 2,
              borderWidth: 1.5,
              borderColor: "#000000",
              elevation: 30,
              height: 20,
              width: 10,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "900", color: "white" }}>
              {overlappedCount}
            </Text>
          </View>
        )}
      </View>
    </Marker>
  );
}
function PostMarker({
  post,
  unfocusAll,
  zoomed,
  // overlapped,
  selectedPost,
  isMapReady,
}: {
  post: DocumentData;
  unfocusAll: boolean;
  zoomed: boolean;
  isMapReady: boolean;
  // overlapped: boolean;
  selectedPost?: DocumentData | undefined;
}) {
  const navigation = useNavigation();
  // Note: marker selection ==> use CONTEXT
  // post lat lng, mapregionchange region?
  function handlePress() {
    console.log("Redirecting ...");
    navigation.navigate("MapScreenNavigation", {
      screen: "PostScreen",
      params: { posts: post },
    });
  }
  return (
    <Marker
      tracksViewChanges={Platform.OS === 'ios' ? true : false}
      coordinate={{
        latitude: post.coordinates.latitude,
        longitude: post.coordinates.longitude,
      }}
      draggable={false}
      calloutAnchor={{ x: 0.5, y: 0 }}
      anchor={{ x: 0.5, y: 1.0 }}
      onPress={post.overlapped ? undefined : handlePress}
    >
      {post.overlapped ? (
        <MaterialCommunityIcons name="blank" size={24} color="black" />
      ) : zoomed ? (
        post == selectedPost ? (
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={40}
            color="#FF4406"
          />
        ) : (
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={30}
            color="#B8FF06"
          />
        )
      ) : post == selectedPost ? (
        <Octicons
          name="dot-fill"
          size={20}
          color="#FF4406"
          style={{ backgroundColor: "transparent" }}
        />
      ) : (
        <Octicons
          name="dot-fill"
          size={20}
          color="#B8FF06"
          style={{ backgroundColor: "transparent" }}
        />
      )}
      {/* <Callout tooltip>
        <View style={styles.bubble}>
          <View style={styles.content}>
            <Text style={styles.contentTitle}>Headline Bold</Text>
            <Text style={styles.contentDescription}>Streets</Text>
            <Text style={styles.contentDescription}>Timestamp</Text>
            <Text style={styles.contentDescription}>Author</Text>
            <Text style={styles.contentDescription}>LIKES COUNT!!!!</Text>
          </View>
        </View>
        <View style={styles.flex}>
          <View style={styles.triangle} />
        </View>
      </Callout> */}
    </Marker>
  );
}
function ShowLocationButton({
  mapRef,
  animatedValue,
  currentRegion,
  center,
}: {
  mapRef: MutableRefObject<null | MapView>;
  animatedValue: Animated.Value;
  currentRegion: Region;
  center?: Region;
}) {
  const { userLocation } = useContext(UserLocationContext);
  const ref = mapRef;

  const getCurrentPosition = () => {
    if (center) {
      ref.current?.animateToRegion(center, 1000);
    } else {
      ref.current?.animateToRegion(
        {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: Math.max(0.01, currentRegion.latitudeDelta),
          longitudeDelta: Math.max(0.01, currentRegion.longitudeDelta),
        },
        1000
      );
    }
  };

  return (
    <Animated.View style={[styles.animatedWrapper, { opacity: animatedValue }]}>
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={getCurrentPosition}
      >
        <Entypo name="location" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    minHeight: 100,
    minWidth: 100,
    overflow: "hidden",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  map: {
    bottom: 0,
    height: "125%",
    width: "100%",
    backgroundColor: "transparent",
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
  animatedWrapper: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  myLocationButton: {
    padding: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8, 10, 13, 0.2)",
  },

  calloutContainer: {
    flexDirection: "column",
    alignSelf: "flex-start",
    backgroundColor: "black",
  },
  bubble: {
    width: 200,
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: "#000000B0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderColor: "#10101000",
    borderWidth: 1,
  },
  content: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "transparent",
  },
  contentTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  contentDescription: {
    fontSize: 8,
    color: "#FFFFFF",
  },
  flex: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 10,
    borderRightWidth: 20,
    borderBottomWidth: 0,
    borderLeftWidth: 20,
    borderTopColor: "#000000B0",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",

    top: -1,
  },
});
