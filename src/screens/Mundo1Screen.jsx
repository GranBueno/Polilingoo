import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useWindowDimensions,
    Platform,
    StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get("window");
export default function Mundo1Screen() {
    return (
        <ImageBackground
            source={require("../assets/Fondo1Verde.png")}
            resizeMode="stretch"
        >
            <View style={styles.rowContainer}>
      <View style={styles.box}><Text>Item 1</Text></View>
      <View style={styles.box}><Text>Item 2</Text></View>
      <View style={styles.box}><Text>Item 3</Text></View>
    </View>
        </ImageBackground>
    );
}