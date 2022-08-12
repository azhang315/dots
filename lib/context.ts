import { LocationObject, LocationObjectCoords } from 'expo-location';
import { DocumentData } from 'firebase/firestore';
import {createContext} from 'react';

type LocationContextType = {
    userLocation: LocationObject;
}
const LocationContextDefaultValues: LocationContextType = {
    userLocation: {
        coords: {
            latitude: 0,
            longitude: 0,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
        },
        timestamp: 0,
    },
}

export const UserLocationContext = createContext<LocationContextType>(LocationContextDefaultValues);

type PostContextType = DocumentData | undefined;
const PostContextDefaultValues: PostContextType = {}

export const PostContext = createContext<PostContextType>(PostContextDefaultValues);