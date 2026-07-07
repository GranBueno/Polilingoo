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
export default function HomeScreen() {
    return (
        <ImageBackground
            source={require("../../assets/GL_GateOfAngels_DuckVsCrab.jpg")}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Text style={styles.title}>Bienvenido a Polilingo</Text>
                <Text style={styles.subtitle}>¡Aprende idiomas de manera divertida!</Text>
                <Pressable style={styles.button} onPress={() => console.log('Navegar a Registro')}>
                    <Text style={styles.buttonText}>Comenzar</Text>
                </Pressable>
            </View>
        </ImageBackground>
    );
}