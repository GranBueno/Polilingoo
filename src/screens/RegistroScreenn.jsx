import React from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import PolilingoNavbarCode from '../components/PolilingoNavbarCode';

const { width, height } = Dimensions.get("window");

export default function RegistroScreenn() {
    return (
        <ImageBackground
                    source={require("../../assets/GL_GateOfAngels_DuckVsCrab.jpg")}
                    resizeMode="stretch"
                    style={styles.background}
                >
        <View style={styles.contenedorPrincipal}>
         

            <PolilingoNavbarCode
                racha={12}
                 energia={5}
                energiaMaxima={7}
                mundoActualIndex={0}
                mundos={[
                    'Bosque Inicial',
                    'Ruinas del Eco',
                    'Montañas Heladas',
                ]}
                onPressPerfil={() => {
                    console.log('Ir al perfil');
                }}
                onPressMundoAnterior={() => {
                    console.log('Mundo anterior');
                }}
                onPressMundoSiguiente={() => {
                    console.log('Mundo siguiente');
                }}
            />
      
            {/* Logo */}
            <View style={styles.logoContainer}>
                <Text style={styles.logoTexto}>LOGO</Text>
            </View>

            {/* Contenedor de formulario */}
            <View style={styles.tarjeta}>
                <View style={styles.campoContainer}>
                    <Text style={styles.label}>Usuario</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Ingrese usuario"
                        placeholderTextColor="#777"
                    />
                </View>

                <View style={styles.campoContainer}>
                    <Text style={styles.label}>Contraseña</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Ingrese contraseña"
                        placeholderTextColor="#777"
                        secureTextEntry
                    />
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
    contenedorPrincipal: {
        flex: 1,
        backgroundColor: "#1A102A",
        alignItems: "center",
    },

    logoContainer: {
        marginTop: height * 0.22,

        width: 140,
        height: 140,

        borderRadius: 70,

        backgroundColor: "#E5D3A4",

        justifyContent: "center",
        alignItems: "center",

        borderWidth: 3,
        borderColor: "#4A2D00",

        shadowColor: "#FFD700",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.6,
        shadowRadius: 15,

        elevation: 12,
    },

    logoTexto: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#4A2D00",
    },

    tarjeta: {
        marginTop: 30,

        width: width * 0.85,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#000",

        borderRadius: 18,

        padding: 20,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,

        elevation: 8,
    },

    campoContainer: {
        marginBottom: 18,
    },

    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 6,
        color: "#222",
    },

    input: {
        height: 50,

        borderWidth: 1,
        borderColor: "#555",

        borderRadius: 10,

        paddingHorizontal: 12,

        backgroundColor: "#FAFAFA",
    },

    boton: {
        marginTop: 10,

        height: 52,

        borderRadius: 12,

        backgroundColor: "#6B46C1",

        justifyContent: "center",
        alignItems: "center",
    },

    botonTexto: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    container: {
        flex: 1,
        backgroundColor: '#111',
    },
});