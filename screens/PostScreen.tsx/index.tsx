import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { PostContext } from "../../lib/context";
// import { PostTabParamList } from "../../types";
import styles from "./styles";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import AppIntroSlider from "react-native-app-intro-slider";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Map from "../../components/Map";
import { DocumentData } from "firebase/firestore";
import { Region } from "react-native-maps";
import { StackActions, useNavigation } from "@react-navigation/native";
import SlidingUpPanel from "rn-sliding-up-panel";
import { GestureStateChangeEvent } from "react-native-gesture-handler";
import Geocoder from "react-native-geocoding";
import Constants from "expo-constants";
import { Video } from "expo-av";
import queryMediaData from "../../lib/queryMediaData";

Geocoder.init(
  Constants.manifest?.android?.config?.googleMaps?.apiKey as string
);

var moment = require("moment");
moment().format();
moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    ss: "%d seconds",
    m: "one minute",
    mm: "%d minutes",
    h: "1 hour",
    hh: "%d hours",
    d: "1 day",
    dd: "%d days",
    w: "a week",
    ww: "%d weeks",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

const slides = [
  {
    key: 1,
    title: "Post Locator",
    text: "<Insert Map Here>",
    // image: require('./assets/1.jpg'),
    backgroundColor: "#59b2ab",
  },
  {
    key: 2,
    title: "Post Details",
    text: "Other cool stuff",
    // image: require('./assets/2.jpg'),
    backgroundColor: "#febe29",
  },
];
export default function PostCard(props: any) {
  const posts: DocumentData = [props.route.params.posts];
  const navigation = useNavigation();
  const [mediaData, setMediaData] = useState<DocumentData>()
  const toQuery = useRef(true);



  useEffect(() => {
    if (toQuery.current == true) {
      toQuery.current = false;
      (async () => {
        const post = posts[0]
        let data = await queryMediaData(post);
        setMediaData(data)
      })()
    }
  }, [mediaData]) // Force Rerender upon 

  console.log(`rerender`)

  
  const renderItem = (renderProps: any) => {
    const slide = renderProps.item;
    console.log(`> ${slide.title}`);
    return (
      <View>
        {slide.title == "Post Locator" && <PostLocatorSlide posts={posts} />}
        {slide.title == "Post Details" && <PostDetailsSlide posts={posts} mediaData={mediaData} />}
      </View>
    );
  };
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(12, 12, 12, 0.3)",
      }}
    >
      <View
        style={{
          backgroundColor: "#E3EBF8",
          height: "95%",
          width: "90%",
          borderRadius: 5,
          elevation: 3,
          top: "2%",
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
        />
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "#FFFFFFC4",
            height: 30,
            width: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 2,
            elevation: 5,
          }}
          onPress={() => navigation.dispatch(StackActions.pop(1))}
        >
          <AntDesign name="back" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const SlidingUpPanelConfig = {
  top: 200,
  bottom: 0,
};
function PostLocatorSlide({ posts }: DocumentData) {
  // Singular Post
  let post = posts[0];
  const center: Region = {
    latitude: post.coordinates.latitude,
    longitude: post.coordinates.longitude,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  };
  const [pointerEvents, setPointerEvents] = useState<"none" | "auto">("auto");

  function handleDragStart() {
    setPointerEvents("none");
  }
  function handleBottomReached() {
    setPointerEvents("auto");
  }
  function handleDragEnd(position: number) {}

  let date = new Date(post.creation.seconds * 1000);
  var postCreationFromNow = moment(date).fromNow();
  var postCreationDate = moment(date);
  var postCreationCalendarTime = moment().calendar(date);

  console.log(postCreationCalendarTime);

  const [street, setStreet] = useState("FooBar Ln");
  const [city, setCity] = useState("Foobar Metro");
  const [state, setState] = useState("FB");
  Geocoder.from({
    latitude: post.coordinates.latitude,
    longitude: post.coordinates.longitude,
  }).then((res) => {
    let street_name = res.results[0].address_components[1].short_name;
    let city_name = res.results[0].address_components[3].short_name;
    let state_name = res.results[0].address_components[5].short_name;

    setStreet(street_name);
    setCity(city_name);
    setState(state_name);
  });

  return (
    <View style={{ backgroundColor: "white", height: "100%" }}>
      <View
        pointerEvents={pointerEvents}
        style={{
          width: "100%",
          height: "80%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
        }}
      >
        <View
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <Map posts={posts} center={center} selectedPost={post} />
        </View>
        <View
          style={{
            backgroundColor: "transparent",
            bottom: 10,
            position: "absolute",
            flexDirection: "row",
            justifyContent: "flex-start",
          }}
        >
          <Ionicons
            name="people-circle-sharp"
            size={30}
            color="#44E867"
            style={{ elevation: 10 }}
          />
          <Ionicons name="people-circle-outline" size={24} color="#5BDEA7" />
          <Ionicons name="scan-circle" size={24} color="black" />
          <Ionicons name="ios-at-circle-outline" size={24} color="black" />
          <Ionicons name="scan-circle-outline" size={24} color="black" />
          <MaterialCommunityIcons
            name="eye-circle"
            size={30}
            color="#FFFFFF"
            style={{ elevation: 10 }}
          />
          <MaterialCommunityIcons name="fire-circle" size={24} color="black" />
          <MaterialCommunityIcons
            name="home-circle-outline"
            size={24}
            color="black"
          />
          <MaterialCommunityIcons
            name="map-marker-circle"
            size={24}
            color="black"
          />
          <MaterialCommunityIcons
            name="pencil-circle-outline"
            size={24}
            color="black"
          />
          <MaterialCommunityIcons name="share-circle" size={24} color="black" />
          <MaterialCommunityIcons
            name="shape-circle-plus"
            size={24}
            color="black"
          />
          <MaterialCommunityIcons name="star-circle" size={24} color="black" />
          <MaterialCommunityIcons
            name="emoticon-cool-outline"
            size={24}
            color="black"
          />
          {/* <Text>Dots (likes, i.e. how many dots (people) has this event connected), Recordings, People talking (comments)</Text> */}
        </View>
      </View>

      <View
        style={{
          marginHorizontal: 20,
          marginTop: 10,
          display: "flex",
          flexDirection: "row",
        }}
      >
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              backgroundColor: "rgba(58, 138, 209, 0.16)",
              borderRadius: 5,
            }}
          >
            {" "}
            {post.headline}{" "}
          </Text>
          <Text style={{ color: "red" }}>Launched {postCreationFromNow}</Text>
          <Text>{postCreationCalendarTime}</Text>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text>
            {city}, {state}
          </Text>
          <Text>near {street}</Text>
        </View>
        {/* TODO: Maybe just use callout mode for more information? */}
      </View>
      {/* <View
        style={{
          backgroundColor: "#4413D6",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <SlidingUpPanel
          backdropOpacity={1}
          draggableRange={{ top: SlidingUpPanelConfig.top, bottom: 0 }}
          snappingPoints={[SlidingUpPanelConfig.top, 0]}
          allowDragging
          height={SlidingUpPanelConfig.top * 2}
          containerStyle={{
            backgroundColor: "white",
            elevation: 10,
            zIndex: 10,
            top: 0,
          }}
          showBackdrop
          backdropStyle={{
            backgroundColor: 'grey'
          }}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onBottomReached={handleBottomReached}
        >
          <>
            <View
              style={{ justifyContent: "center", alignItems: "center", top: 2 }}
            >
              <View
                style={{
                  backgroundColor: "#FFFFFFCE",
                  borderColor: "#12063524",
                  borderWidth: 0.5,
                  height: 5,
                  width: 50,
                  borderRadius: 15,
                  elevation: 2,
                }}
              />
            </View>
            <View>
              <Text>{post.headline}</Text>
              <Text>{post.description} Description Here</Text>
              <Text>Live {postCreationFromNow}</Text>
              <Text>{postCreationCalendarTime}</Text>
            </View>
          </>
        </SlidingUpPanel>
      </View> */}
    </View>
  );
}

function PostDetailsSlide({ posts, mediaData }: {posts: DocumentData, mediaData: DocumentData | undefined}) {
  let post = posts[0];
  console.log(`important mediadata = ${mediaData}`)
  return (
    <View style={{ backgroundColor: "yellow", height: "100%" }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ flex: 2 }}>
          <Text>{post.headline}</Text>
          <Text>{post.description}description here</Text>
          <Text>{JSON.stringify(post.creation)}</Text>
          <Text>FULL DETAILS HERE</Text>
        </View>
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <Text>{post.author}</Text>
          <Text>Author Blurb Here (links, headshot link to profile)</Text>
        </View>
      </View>
      <View style={{ flex: 2, backgroundColor: "purple" }}>
        <Text>Live comment thread, likes and comments</Text>
        {
          mediaData ?
          mediaData.map((media: DocumentData) => 
          <View>
            <Text>Media List Goes Here</Text>
            <Video
            style={{ width: 100, height: 100, aspectRatio: 16/9, backgroundColor: 'black' }}
            source={{ uri: media.videoDownloadURL }}
            key={post.postId}
            isLooping={true}
          /> 
          </View>
          ) : <Text>media not yet loaded ...</Text>
}
      </View>
    </View>
  );
}

// function PostScreenNavigation() {
//   return <PostScreenTopTabs />;
// }

// // TODO: try to pass in () => {} to component head of Tab.Navigator and such
// const tabBarOptions: MaterialTopTabNavigationOptions = {
//   tabBarShowLabel: true,
//   tabBarStyle: {
//     backgroundColor: "transparent",
//   },
// };
// const presentationOptions: MaterialTopTabNavigationOptions = {
//   lazy: true,
//   tabBarContentContainerStyle: {
//     width: "95%",
//     height: 100,
//     left: "2.5%",
//     top: "0%",
//     borderRadius: 10,
//     backgroundColor: "transparent",
//   },
// };
// const screenOptions: MaterialTopTabNavigationOptions = {
//   ...presentationOptions,
//   ...tabBarOptions,
// };
// const Tab = createMaterialTopTabNavigator<PostTabParamList>();
// function PostScreenTopTabs() {
//   return (
//     <Tab.Navigator
//       initialRouteName="PostLocatorCard"
//       screenOptions={screenOptions}
//       initialLayout={{
//         width: Dimensions.get("window").width,
//         height: Dimensions.get("window").height * 0.8,
//       }}
//       sceneContainerStyle={{
//         display: "flex",
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "red",
//       }}
//       style={{}}
//       tabBarPosition={"top"}
//     >
//       <Tab.Screen
//         name="PostLocatorCard"
//         component={PostLocatorCard}
//         options={{ tabBarShowLabel: false }}
//       ></Tab.Screen>
//       <Tab.Screen
//         name="PostDetailsCard"
//         component={PostDetailsCard}
//         options={{ tabBarShowLabel: false }}
//       ></Tab.Screen>
//     </Tab.Navigator>
//   );
// }
