/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DocumentData } from "firebase/firestore";

import 'react-native-svg';
declare module 'react-native-svg' {
  export interface SvgProps {
    xmlns?: string;
    xmlnsXlink?: string;
  }
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Login: undefined;
  Modal: undefined;
  NotFound: undefined;
  Profile: undefined;
  MapScreenNavigation: NavigatorScreenParams<MapStackParamList> | undefined;
  Camera: undefined;
  CreatePost: {source: string, sourceThumb: string | undefined},
  SaveMediaToExistingPost: {source: string, sourceThumb: string | undefined, localPosts: DocumentData | undefined},
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
  MapScreenNavigation: DocumentData | undefined;
  ReportIncident: undefined;
  TabCamera: undefined;
  
};
export type MapStackParamList = {
  MapScreen: undefined,
  PostScreen: DocumentData | undefined,
  // PostScreenNavigation: NavigatorScreenParams<PostTabParamList>,
}
// export type PostTabParamList = {
//   PostLocatorCard: any,
//   PostDetailsCard: any,
// }

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;
