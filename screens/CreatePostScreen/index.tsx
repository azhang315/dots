import {
  StackActions,
  TabActions,
  useNavigation,
} from "@react-navigation/native";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./styles";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { createPost } from "../../lib/createPost";
import Map from "../../components/Map";
import { PostContext, UserLocationContext } from "../../lib/context";
import { DocumentData } from "firebase/firestore";
import { LatLng, Region } from "react-native-maps";
import Constants from "expo-constants";
import Geocoder from 'react-native-geocoding'
import { createStackNavigator } from "@react-navigation/stack";


export default function CreatePostScreen(props: any) {

  const { userLocation } = useContext(UserLocationContext);
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [requestRunning, setRequestRunning] = useState(false);
  const navigation = useNavigation();

  // Synthetic Post Data for UX
  const posts: DocumentData = [{
    coordinates: {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
    }
  },
  // {
  //   coordinates: {
  //     latitude: userLocation.coords.latitude + 0.001,
  //     longitude: userLocation.coords.longitude + 0.001,
  //   }
  // }
];
  const center: Region = {
    latitude: userLocation.coords.latitude,
    longitude: userLocation.coords.longitude,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  };
  
  // const dispatch = useDispatch();
  const handleSavePost = async () => {
    setRequestRunning(true);
    await createPost(
      headline,
      description,
      props.route.params.source,
      props.route.params.sourceThumb,
      userLocation
    );
    setRequestRunning(false);
    navigation.dispatch(StackActions.popToTop());
    navigation.dispatch(TabActions.jumpTo("TabOne"));
  };

  if (requestRunning) {
    return (
      <View style={styles.uploadingContainer}>
        <ActivityIndicator color="red" size="large" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text>Create an Event!</Text>
      <View style={styles.spacer} />
      <View style={styles.formContainer}>
        <View>
          {/* Parse through user-inputted headlines and/or descriptions, format and edit correctly to be passed to database, map render*/}
          <Text>Headline*</Text>
          <TextInput
            style={styles.inputText}
            maxLength={150}
            multiline={false}
            onChangeText={(text) => setHeadline(text)}
            placeholder="armed assailant near Andrew Station"
          />
          <Text>Additional Description (optional)</Text>
          <TextInput
            style={styles.inputText}
            maxLength={150}
            multiline
            onChangeText={(text) => setDescription(text)}
            placeholder="wearing dark blue hoodie"
          />
        </View>
        <Image
          style={styles.mediaPreview}
          source={{ uri: props.route.params.source }}
          // source={{ uri: props.route.params.source }}
        />
      </View>
      <View style={styles.formContainer}>
        <View style={styles.separator} />
      </View>
      <View style={styles.mapContainer}>
        <View style={styles.mapWrapper}>
          <Map posts={posts} center={center} disableUserLocation/>
          {/* <Map posts={{coordinates: {latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude}}}/>  */}
          {/* // TODO : INSERT SYNTHETIC USER LOCATION POST */}
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(StackActions.popToTop())}
          style={styles.cancelButton}
        >
          <Feather name="x" size={24} color="black" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSavePost()}
          style={styles.postButton}
        >
          <Feather name="corner-left-up" size={24} color="white" />
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
