import React, { useContext, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import useLocationData from "./hooks/useLocationData";
import { PostContext, UserLocationContext } from "./lib/context";
import Navigation from "./navigation";

import { LocationObject } from "expo-location";
import { DocumentData, collectionGroup, query, limit, DocumentSnapshot } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { LatLng } from "react-native-maps";
import { firestore } from "./lib/firebase";
import { BOSTON } from "./constants/Coordinates";


export default function App() {
  console.log(`... app render ...`);
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  // const userLocationData = useLocationData(); FIXME: REAL LOCATION DATA (Mtn. View)


  // TODO:Refactor into hook, maybe a useEffect((userLocationData => {}), [userLocationData])

  const { userLocation } = useContext(UserLocationContext);
  const [posts, setPosts] = useState<DocumentData>();


  // FIXME: SYNTHETIC LOCATION (Boston)
const userLocationData = {userLocation: {
  coords: {
      latitude: BOSTON.latitude + 0.001,
      longitude: BOSTON.longitude + 0.001,
      altitude: null,
      accuracy: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
  },
  timestamp: 0,
}};
  // Default whole-collection query to attach listen
  let q = collectionGroup(firestore, "posts");

  // Substitute for specific queries when specified with child to parent props
  // TODO: Paramaterize: pass back from Screen to Navigator
  const QUERY_TYPE = "geolocation"; // query_type
  const DISTANCE = 50; // distance?
  const LIMIT = 100;
  if (userLocation.coords) {
    if (QUERY_TYPE == "geolocation" && DISTANCE) {
      const { geoUpperBound, geoLowerBound } = determineGeoBounds(
        userLocation,
        DISTANCE
      );
      console.log("using geolocation query");
      q = query(
        collectionGroup(firestore, "posts"),
        // where("date", "==", Timestamp.now().toDate()),
        // where("coordinates", "<=", geoUpperBound),
        // where("coordinates", ">=", geoLowerBound),
        limit(LIMIT)
      );
    }
  }
  // format query,
  // pass in query to usecollection
  const [value, loading, error] = useCollection(q);

  useEffect(() => {
    console.log(">> Fetching / Setting Updated Posts -- DB queried");

    if (value) {
      let postDocs: DocumentData | undefined = [];
      const temp = value.docs.map((doc: DocumentSnapshot) => {
        postDocs?.push(doc.data());
      });
      setPosts(postDocs);
    }
  }, [value]);

  console.log(`APP: posts = ${posts}`)

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <UserLocationContext.Provider value={userLocationData}>
        <PostContext.Provider value={posts}>
        <SafeAreaProvider>
          <Navigation colorScheme={colorScheme}/>
          <StatusBar />
        </SafeAreaProvider>
        </PostContext.Provider>
      </UserLocationContext.Provider>
    );
  }
}


function determineGeoBounds(userLocation: LocationObject, distance: number) {
  let lat = 0.0144927536231884;
  let lng = 0.0181818181818182;
  let lng_bound = lat * distance;
  let lat_bound = lng * distance;
  const geoUpperBound: LatLng = {
    latitude: userLocation.coords.latitude + lat_bound,
    longitude: userLocation.coords.longitude + lng_bound,
  };
  const geoLowerBound: LatLng = {
    latitude: userLocation.coords.longitude - lat_bound,
    longitude: userLocation.coords.longitude - lng_bound,
  };
  return { geoUpperBound, geoLowerBound };
}
