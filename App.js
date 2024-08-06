import { StatusBar } from 'expo-status-bar';
import { AnonymousPro_400Regular, AnonymousPro_700Bold, useFonts } from '@expo-google-fonts/anonymous-pro'

import {NavigationContainer } from '@react-navigation/native';
import Routes from './src/routes';

export default function App() {

  let [fontsLoaded] = useFonts({
    AnonymousPro_400Regular,
    AnonymousPro_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar  barStyle="light-content"/>
      <Routes/>
    </NavigationContainer>
  );
}
