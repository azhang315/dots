import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import {
  Camera,
  CameraType,
  FlashMode,
  requestCameraPermissionsAsync,
} from "expo-camera";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as VideoThumbnails from "expo-video-thumbnails";

import { useIsFocused } from "@react-navigation/core";
import { Feather } from "@expo/vector-icons";

import styles from "./styles";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { PagedInfo } from "expo-media-library";
import { queryPostData } from "../../lib/queryPostData";
import { UserLocationContext } from "../../lib/context";
import { DocumentData } from "firebase/firestore";
import { stringLength } from "@firebase/util";

export default function CameraScreen() {
  const { userLocation } = useContext(UserLocationContext);
  
  const [hasCameraPermissions, setHasCameraPermissions] = useState(false);
  const [hasAudioPermissions, setHasAudioPermissions] = useState(false);
  const [hasGalleryPermissions, setHasGalleryPermissions] = useState(false);

  const [galleryItems, setGalleryItems] = useState<MediaLibrary.Asset[]>([]);

  const [cameraRef, setCameraRef] = useState<Camera | null>(null);
  const [cameraType, setCameraType] = useState<number | CameraType>(
    CameraType.back
  );
  const [cameraFlash, setCameraFlash] = useState<number | FlashMode>(
    FlashMode.off
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const isFocused = useIsFocused();

  const navigation = useNavigation();
  const [navigating, setNavigating] = useState(false);
const [videoRecordPromise, setVideoRecordPromise] = useState<Promise<{uri: string;}>>();
  useFocusEffect(useCallback(
    () => {
      setNavigating(false);

      return () => {
        setNavigating(false);
      }
    },
    [],
  ));

  useEffect(() => {
    (async () => {
      const cameraStatus = await requestCameraPermissionsAsync();
      setHasCameraPermissions(cameraStatus.status == "granted");

      const audioStatus = await Audio.requestPermissionsAsync();
      setHasAudioPermissions(audioStatus.status == "granted");

      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermissions(galleryStatus.status == "granted");

      if (galleryStatus.status == "granted") {
        const userGalleryMedia = await MediaLibrary.getAssetsAsync({
          sortBy: ["creationTime"],
          mediaType: ["video"],
        });
        setGalleryItems(userGalleryMedia.assets);
      }
    })();
  }, []);

  const recordVideo = async () => {
    console.log('recording video ...')
    if (cameraRef) {
      try {
        const options = {
          maxDuration: 60,
          quality: Camera.Constants.VideoQuality["480"],
        };
        const videoRecordPromise = cameraRef.recordAsync(options);
        if (videoRecordPromise) {
          setVideoRecordPromise(videoRecordPromise);
          

        }
      } catch (error) {
        console.warn(error);
      }
    }
  };

  const stopVideo = async () => {
    console.log('stopping video ...')
    if (cameraRef) {
      cameraRef.stopRecording();
    }
    const data = await videoRecordPromise;
    if (data) {
      const source = data.uri;
      let sourceThumb = await generateThumbnail(source);
  
      let queryDistanceMeters = 20; // 50m == LatLng{0.000449, 0.000449}
      const localPosts: DocumentData | undefined = await queryPostData(userLocation, 'locality', queryDistanceMeters);
      if (localPosts?.length == 0) {
        navigation.navigate("CreatePost", { source, sourceThumb });
      }
      else {
        // navigation.navigate("SaveMediaToExistingPost", { source, sourceThumb });
        navigation.navigate("SaveMediaToExistingPost", { source, sourceThumb, localPosts });
  
      }
    }
    else {
      console.warn('videoRecordPromise returned undefined')
    }

  };
  const handleVideoRecord = async () => {
    if (!navigating) {
      if (cameraRef) {
        if (!isRecording) {
          recordVideo();
          setIsRecording(true);
        } else {
          setIsRecording(false);
          setNavigating(true);
          setTimeout(() => {
            stopVideo();
          }, 1000);
        }
      }
    }
  };

  // const pickFromGallery = async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Videos,
  //     allowsEditing: true,
  //     aspect: [16, 9],
  //     quality: 1,
  //   });
  //   if (!result.cancelled) {
  //     let sourceThumb = await generateThumbnail(result.uri);
  //     navigation.navigate("savePost", { source: result.uri, sourceThumb });
  //   }
  // };

  const generateThumbnail = async (source: string) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(source);
      return uri;
    } catch (e) {
      console.warn(e);
    }
  };

  if (!hasCameraPermissions || !hasAudioPermissions || !hasGalleryPermissions) {
    return (
      <View>
        <Text>Please Activate Permissions</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused ? (
        <Camera
          ref={(ref) => setCameraRef(ref)}
          style={styles.camera}
          ratio={"16:9"}
          type={cameraType}
          flashMode={cameraFlash}
          onCameraReady={() => setIsCameraReady(true)}
        />
      ) : null}

      {!isRecording && !navigating && (
        <View style={styles.sideBarContainer}>
          <TouchableOpacity
            style={styles.sideBarButton}
            onPress={() =>
              setCameraType(
                cameraType === CameraType.back
                  ? CameraType.front
                  : CameraType.back
              )
            }
          >
            <Feather name="refresh-ccw" size={24} color={"white"} />
            <Text style={styles.iconText}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideBarButton}
            onPress={() =>
              setCameraFlash(
                cameraFlash === FlashMode.off ? FlashMode.torch : FlashMode.off
              )
            }
          >
            <Feather name="zap" size={24} color={"white"} />
            <Text style={styles.iconText}>Flash</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomBarContainer}>
        {!isRecording && !navigating && <View style={{ flex: 1 }} />}
        <View style={styles.recordButtonContainer}>
          <TouchableOpacity
            disabled={!isCameraReady}
            onPressIn={() => handleVideoRecord()}
            style={
              isRecording ? styles.recordButtonPressed : (
                navigating ? styles.disabledRecordButton : styles.recordButton
              )
            }
          />
        </View>
        {!isRecording && !navigating && (
          <View style={{ flex: 1 }}>
            {/* <TouchableOpacity
              onPress={() => pickFromGallery()}
              style={styles.galleryButton}
            >
              {galleryItems[0] == undefined ? (
                <></>
              ) : (
                <Image
                  style={styles.galleryButtonImage}
                  source={{ uri: galleryItems[0].uri }}
                />
              )}
            </TouchableOpacity> */}
          </View>
        )}
      </View>
    </View>
  );
}
