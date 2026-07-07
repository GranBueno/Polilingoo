import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {
    useFonts as useCinzelFonts,
    Cinzel_400Regular,
    Cinzel_700Bold,
    Cinzel_900Black,
} from '@expo-google-fonts/cinzel';

import {
    useFonts as useAlegreyaFonts,
    Alegreya_400Regular,
    Alegreya_500Medium,
    Alegreya_700Bold,
    Alegreya_400Regular_Italic,
} from '@expo-google-fonts/alegreya';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
