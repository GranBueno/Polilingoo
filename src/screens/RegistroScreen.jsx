import React from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function RegistroScreen() {
    return (
        <ImageBackground
            source={require("../../assets/GL_GateOfAngels_DuckVsCrab.jpg")}
            resizeMode="cover"
            style={styles.background}
        >
            <View style={styles.overlay}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoTexto}>LOGO</Text>
                </View>

                {/* Formulario */}
                <View style={styles.tarjeta}>
                    <View style={styles.contenidoTarjeta}>
                        <View style={styles.campoContainer}>
                            <Text style={styles.label}>Usuario</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Ingrese usuario"
                                placeholderTextColor="#444"
                            />
                        </View>

                        <View style={styles.campoContainer}>
                            <Text style={styles.label}>Correo electrónico</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Ingrese correo electrónico"
                                placeholderTextColor="#444"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.campoContainer}>
                            <Text style={styles.label}>Contraseña</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Ingrese contraseña"
                                placeholderTextColor="#444"
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.boton}>
                        <Text style={styles.botonTexto}>
                            Registrarse
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },

    overlay: {
        flex: 1,
        alignItems: "center",
    },

    logoContainer: {
        marginTop: height * 0.18,

        width: 140,
        height: 140,

        borderRadius: 70,

        backgroundColor: "#F4EAD0",

        justifyContent: "center",
        alignItems: "center",

        borderWidth: 2,
        borderColor: "#000",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,

        elevation: 8,
    },

    logoTexto: {
        fontSize: 24,
        fontWeight: "bold",
    },

    tarjeta: {
        marginTop: 25,

        width: width * 0.88,

        borderRadius: 20,

        borderWidth: 1,
        borderColor: "#000",

        backgroundColor: "rgba(255,255,255,0.50)",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,

        elevation: 10,

        overflow: "hidden",
    },

    contenidoTarjeta: {
        padding: 20,
    },

    campoContainer: {
        marginBottom: 18,
    },

    label: {
        color: "#000",
        fontWeight: "600",
        marginBottom: 6,
        fontSize: 15,
    },

    input: {
        height: 50,

        backgroundColor: "rgba(255,255,255,0.50)",

        borderWidth: 1,
        borderColor: "#000",

        borderRadius: 10,

        paddingHorizontal: 12,

        color: "#000",
    },

    boton: {
        height: 55,

        backgroundColor: "rgba(107,70,193,0.70)",

        justifyContent: "center",
        alignItems: "center",
    },

    botonTexto: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 17,
    },
});