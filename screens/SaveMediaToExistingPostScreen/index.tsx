import {
  StackActions,
  TabActions,
  useNavigation,
} from "@react-navigation/native";
import React, { useCallback, useContext, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { createPost } from "../../lib/createPost";
import styles from "./styles";
import Map from "../../components/Map";
import { PostContext, UserLocationContext } from "../../lib/context";
import { DocumentData } from "firebase/firestore";
import { LatLng, Region } from "react-native-maps";
import Constants from "expo-constants";

import { createStackNavigator } from "@react-navigation/stack";
import AppIntroSlider from "react-native-app-intro-slider";

export default function SaveMediaToExistingPostScreen(props: {
  route: {
    params: {
      source: string;
      sourceThumb: string;
      localPosts: DocumentData;
    };
  };
}) {
  const source = props.route.params.source;
  const sourceThumb = props.route.params.sourceThumb;
  const localPosts = props.route.params.localPosts;

  const { userLocation } = useContext(UserLocationContext);
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [requestRunning, setRequestRunning] = useState(false);
  const [postIndex, setPostIndex] = useState(0);
  const navigation = useNavigation();

  const center: Region = {
    latitude: userLocation.coords.latitude,
    longitude: userLocation.coords.longitude,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  };

  const _onViewableItemsChanged = useCallback(({ viewableItems, changed }) => {

    console.log(viewableItems[0].index)
    setPostIndex(viewableItems[0].index)
}, []);

  // const dispatch = useDispatch();
  const handleSaveMediaToExistingPost = async () => {
    setRequestRunning(true);
    await createPost(
      headline,
      description,
      source,
      sourceThumb,
      userLocation,
      localPosts[postIndex],
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
  const handleNavigate = () => {
    navigation.navigate("CreatePost", { source, sourceThumb });
  }



  return (
    <View style={styles.container}>
      <Text>We found {localPosts?.length} events near you.</Text>
      <Text>Are you at any of these places?</Text>
      <View style={{ backgroundColor: "pink", flex: 4 }}>
        <PostCarousel localPosts={localPosts} eventFn={_onViewableItemsChanged} />
      </View>
      <View
        style={{
          backgroundColor: "purple",
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={handleSaveMediaToExistingPost}>
          <Text>Yes I am here</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNavigate}>
          <Text>No I am not</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PostCarousel({ localPosts, eventFn }: {localPosts: DocumentData | undefined, eventFn: any}) {
  const navigation = useNavigation();

  const renderItem = (renderProps: any) => {
    const slide = renderProps.item;

    const post = slide.post;
    const center: Region = {
      latitude: post.coordinates.latitude,
      longitude: post.coordinates.longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    };
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <View
          style={{
            backgroundColor: "#2F9191",
            height: "90%",
            width: "90%",
            borderRadius: 5,
            elevation: 3,
            overflow: "hidden",
          }}
        >
          <View style={{ height: "100%", width: "100%" }}>
            <Map posts={localPosts} selectedPost={post} center={center} disableUserLocation/>
            <View
              style={{ position: "absolute", backgroundColor: "#0707075E" }}
            >
              <Text style={{ color: "white", fontWeight: "100", fontSize: 14 }}>
                <Text>{post.headline}</Text>
                <Text>Address Line</Text> // TODO:
                <Text>Time Launched</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
      
    );
  };

  const slides = localPosts?.map((localPost: DocumentData) => {
    return { key: localPost.storagePostId, post: localPost };
  });


const viewConfigRef = { itemVisiblePercentThreshold: 50 };
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <View
        style={{
          backgroundColor: "#272828",
          height: "95%",
          width: "90%",
          borderRadius: 5,
          elevation: 3,
          overflow: "hidden",
        }}
      >
        <AppIntroSlider
          renderItem={renderItem}
          data={slides}
          dotClickEnabled
          dotStyle={{
            backgroundColor: "rgba(0, 0, 0, .5)",
            height: 7,
            width: 7,
          }}
          activeDotStyle={{
            backgroundColor: "rgba(0, 0, 0, .8)",
            height: 9,
            width: 9,
          }}
          showNextButton={false}
          showDoneButton={false}
          onViewableItemsChanged={eventFn}
          viewabilityConfig={viewConfigRef}
        />
      </View>
    </View>
  );
}
