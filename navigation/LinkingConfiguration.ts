/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList } from '../types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Login: {
        screens: {
          EnterScreen: 'one',
        }
      },
      Root: {
        screens: {
          TabOne: {
            screens: {
              TabOneScreen: 'one',
            },
          },
          TabTwo: {
            screens: {
              TabTwoScreen: 'two',
            },
          },
          MapScreen: {

          },
          ReportIncident: {
            screens: {
              ReportIncidentScreen: 'four',
            }
          },
          Camera: {
            screens: {
              Camera: 'five',
            }
          }
        },
      },
      Modal: 'modal',
      NotFound: '*',
    },
  },
};

export default linking;
