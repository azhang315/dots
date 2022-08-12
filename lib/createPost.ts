import { LocationObject } from "expo-location";
import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  DocumentData,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, StorageReference, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { useContext } from "react";
import { LatLng } from "react-native-maps";
import { notInitialized } from "react-redux/es/utils/useSyncExternalStore";
// import { saveMediaToStorage } from '../../services/random'
// require('firebase/firebase-auth')
// require('firebase/firestore')
import uuid from "uuid-random";
// import { CURRENT_USER_POSTS_UPDATE } from '../constants'
import { storage, firestore, auth, postToJSON } from "./firebase";
import Geocoder from 'react-native-geocoding'
import Constants from 'expo-constants'

// Create Firestore Ref to stored media (in FB storage)
export async function createPost(
  headline: string,
  description: string,
  video: string,
  thumbnail: string,
  userLocation: LocationObject,
  post?: DocumentData,
) {
  const coordinates: LatLng = {latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude};

  const batch = writeBatch(firestore);
  let downloadURLs: string[] = [];
  let storagePostId = uuid();
  let postId = uuid();
  // Creation
  if (!post) {
    downloadURLs.push(await saveMediaToStorage(
      video,
      `posts/${postId}/${auth.currentUser?.uid}/${storagePostId}/video`
    ));
    downloadURLs.push(await saveMediaToStorage(
      thumbnail,
      `posts/${postId}/${auth.currentUser?.uid}/${storagePostId}/thumbnail`
    ));
    const postRef = doc(collection(firestore, "posts"), postId);
    const mediaRef = doc(collection(doc(collection(firestore, "posts"), postId), "media"), storagePostId);
    const postData = {
      authorUid: auth.currentUser?.uid,
      authorDisplayName: auth.currentUser?.displayName,
      headline,
      description,
      coordinates,
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      mediaCount: 1,
      creation: serverTimestamp(),
      postId,
      // storagePostId,
    };
    const mediaData = {
      videoDownloadURL: downloadURLs[0],
      thumbnailDownloadURL: downloadURLs[1],
      creation: serverTimestamp(),
    }
    batch.set(postRef, postData);
    batch.set(mediaRef, mediaData);
  }
  // Append to Existing
  else {
    downloadURLs.push(await saveMediaToStorage(
      video,
      `posts/${post.postId}/${auth.currentUser?.uid}/${storagePostId}/video`
    ));
    downloadURLs.push(await saveMediaToStorage(
      thumbnail,
      `posts/${post.postId}/${auth.currentUser?.uid}/${storagePostId}/thumbnail`
    ));
    const postRef = doc(collection(firestore, "posts"), post.postId);
    const mediaRef = doc(collection(doc(collection(firestore, 'posts'), post.postId), "media"), storagePostId);
    const postData = {
      mediaCount: post.mediaCount + 1,
    }
    const mediaData = {
      videoDownloadURL: downloadURLs[0],
      thumbnailDownloadURL: downloadURLs[1],
      creation: serverTimestamp(),
    }
    batch.update(postRef, postData);
    batch.set(mediaRef, mediaData);
  }

  await batch.commit();
  // await setDoc(ref, data);

  


  // // TODO: Identify which storagePostId it should be put under
  // if (post exists in geographic area) {
  //   append media items to existing post
  // }
  // else if (post does not exist) {
  //   create new post
  //   ask if want to append to nearby posts
  //   if not, create anyways
  // }
  // note: range?
  // const mediaRef = collection(doc(collection(firestore, 'posts'), storagePostId), '')
  // const mediaData = {
  //   videoDownloadURL: downloadURLs[0],
  //   thumbnailDownloadURL: downloadURLs[1],
  // }
}

async function saveMediaToStorage(
  media: string,
  path: string
): Promise<string> {

  const fileRef = ref(storage, path);

  const res = await fetch(media);
  let data: Blob = await res.blob();
  let completedUploadTaskRef: StorageReference = {} as StorageReference;
  const snapshot = await uploadBytes(fileRef, data);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}
