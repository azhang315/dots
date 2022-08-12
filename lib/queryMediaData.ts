import { collectionGroup, collection, doc, DocumentData, getDocs, limit, query, where } from 'firebase/firestore';
import React from 'react'
import { firestore, postToJSON } from './firebase';

export default async function queryMediaData(post: DocumentData) {
    console.log("media query ... ")
    const mediaQuery = query(
        collection(doc(collection(firestore, "posts"), post.postId), "media"),
        limit(10)
      );
  
      const mediaData: DocumentData = (await getDocs(mediaQuery)).docs.map(postToJSON);  

      console.log("media query complete!")
      return mediaData;
}
