import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    ActivityIndicator,
} from "react-native";

import Database from "../class/Database";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
    const [nombre, setNombre] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const iniciarSesion = async () => {
        if (isLoggingIn) {
            return;
        }

        const nombreLimpio = String(nombre ?? "").trim();
        const contrasenaLimpia = String(contrasena ?? "");

        if (!nombreLimpio || !contrasenaLimpia) {
            setError("Ingresa tu usuario y contraseña.");
            return;
        }

        try {
            setIsLoggingIn(true);
            setError("");

            const conexion = Database.obtenerConexion();

            const usuarioEncontrado = await conexion.getFirstAsync(
                `
                SELECT *
                FROM usuarios
                WHERE LOWER(nombre) = LOWER(?)
                LIMIT 1
                `,
                [nombreLimpio]
            );

            if (!usuarioEncontrado) {
                setError("El usuario no existe.");
                return;
            }

            const contrasenaProcesada = await Database.crearHashContrasena(
                contrasenaLimpia,
                usuarioEncontrado.contrasena_salt
            );

            if (contrasenaProcesada.hash !== usuarioEncontrado.contrasena_hash) {
                setError("La contraseña es incorrecta.");
                return;
            }

            await Database.registrarActividadDiaria(usuarioEncontrado.id);

            navigation.replace("Mundo1Screen", {
                usuarioId: usuarioEncontrado.id,
            });
        } catch (loginError) {
            console.error("Error al iniciar sesión:", loginError);
            setError(loginError.message ?? "No se pudo iniciar sesión.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <ImageBackground
            source={require("../../assets/GL_GateOfAngels_DuckVsCrab.jpg")}
            resizeMode="stretch"
            style={styles.background}
        >
            <View style={styles.overlay}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoTexto}>LOGO</Text>
                </View>

                <View style={styles.tarjeta}>
                    <View style={styles.contenidoTarjeta}>
                        <View style={styles.campoContainer}>
                            <Text style={styles.label}>Usuario</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Ingrese usuario"
                                placeholderTextColor="#444"
                                value={nombre}
                                onChangeText={setNombre}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.campoContainer}>
                            <Text style={styles.label}>Contraseña</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Ingrese contraseña"
                                placeholderTextColor="#444"
                                secureTextEntry
                                value={contrasena}
                                onChangeText={setContrasena}
                            />
                        </View>

                        {error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.boton,
                            isLoggingIn && styles.botonDeshabilitado,
                        ]}
                        onPress={iniciarSesion}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.botonTexto}>
                                Iniciar sesión
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkContainer}
                        onPress={() => navigation.replace("RegistroScreen")}
                    >
                        <Text style={styles.linkTexto}>
                            ¿No tienes una cuenta?{" "}
                            <Text style={styles.linkTextoDestacado}>
                                Registrarse
                            </Text>
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

    botonDeshabilitado: {
        opacity: 0.65,
    },

    errorText: {
        marginTop: -4,
        color: "#7A1515",
        fontWeight: "700",
        fontSize: 13,
        textAlign: "center",
    },

    linkContainer: {
        paddingVertical: 14,
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.35)",
    },

    linkTexto: {
        color: "#000",
        fontSize: 14,
        fontWeight: "600",
    },

    linkTextoDestacado: {
        color: "#3A1E78",
        fontWeight: "900",
    },
});