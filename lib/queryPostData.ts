import { LocationObject } from "expo-location";
import {
  query,
  collectionGroup,
  where,
  limit,
  onSnapshot,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { useContext, useEffect } from "react";
import { LatLng } from "react-native-maps";
import { UserLocationContext } from "./context";
import { firestore, postToJSON } from "./firebase";

const LIMIT = 100;

function metersToLatLng(meters: number) {
  var earth = 6378.137,  //radius of the earth in kilometer
  pi = Math.PI,
  cos = Math.cos,
  m = (1 / ((2 * pi / 360) * earth)) / 1000;  //1 meter in degree

    var latitude = (meters * m);
    var longitude = (meters * m) / cos(latitude * (pi / 180));
return {latitude, longitude};
}

export async function queryPostData(userLocation: LocationObject, queryType: string, meters?: number) {
  console.log("QUERY");

  if (queryType == "locality" && meters) {
    let {latitude: lat_bound, longitude: lng_bound} = metersToLatLng(meters);
    console.log(`lat bound = ${lat_bound}`)
    console.log(`lng bound = ${lng_bound}`)

    const userLat = userLocation.coords.latitude;
    const userLng = userLocation.coords.longitude;
    const geoUpperBound: LatLng = {
      latitude: userLat + lat_bound,
      longitude: userLng + lng_bound,
    };
    const geoLowerBound: LatLng = {
      latitude: userLat - lat_bound,
      longitude: userLng - lng_bound,
    };

    console.log(`Userlocation= ${JSON.stringify(userLocation)}`);
    console.log(`geoBounds (upper, lower) = ${JSON.stringify(geoUpperBound)}, ${JSON.stringify(geoLowerBound)}`);

    const postsQuery = query(
      collectionGroup(firestore, "posts"),
      // where("date", "==", new Date().getDate()), TODO: configure current dates
      where("coordinates", "<=", geoUpperBound),
      where("coordinates", ">=", geoLowerBound),
      limit(LIMIT)
    );

    const posts: DocumentData = (await getDocs(postsQuery)).docs.map(postToJSON);

    console.log("DONE QUERYING")

    return posts;
  } else {
    console.warn("Query fields loosely defined");
  }
}