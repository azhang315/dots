import { getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { DocumentData, DocumentSnapshot, getDocs, getFirestore, QueryDocumentSnapshot } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { collection, where, query, limit } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDX0DiYdGz5g1_YXnykhY-DksMpYLQbZao",
  authDomain: "csafe-project.firebaseapp.com",
  projectId: "csafe-project",
  storageBucket: "csafe-project.appspot.com",
  messagingSenderId: "76953593644",
  appId: "1:76953593644:web:a1e69d81368fd6e960ae89",
  measurementId: "G-TNYCKXYSQW",
};

var app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Helper Functions

// Gets a users/{uid} document with username
// @param {string} username
export async function getUserWithUsername(username: string) {
  const usersRef = collection(firestore, "users");
  const userQuery = query(
    usersRef,
    where("username", "==", username),
    limit(1)
  );
  const userDoc = (await getDocs(userQuery)).docs[0];
  return userDoc;
}

// Converts firestore document to JSON (timestamps --> ...)
// @param {DocumentSnapshot} doc
export function postToJSON(doc: DocumentData) {
  const data = doc.data();
  return {
    ...data,
    creation: data.creation.toMillis(),
    // updatedAt: data.updatedAt.toMillis(),
  }
}

