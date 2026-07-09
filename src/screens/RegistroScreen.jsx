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

import Usuario from "../class/Usuarios";
import Database from "../class/Database";

const { width, height } = Dimensions.get("window");

export default function RegistroScreen({ navigation }) {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const registrarUsuario = async () => {
        if (isRegistering) {
            return;
        }

        const usuario = new Usuario(nombre, correo, contrasena);
        const validacion = usuario.validarTodo();

        if (!validacion.valido) {
            setError(validacion.errores[0]);
            return;
        }

        try {
            setIsRegistering(true);
            setError("");

            const usuarioRegistrado = await Database.registrarUsuario(usuario);

            navigation.replace("Mundo1Screen", {
                usuarioId: usuarioRegistrado.id,
            });
        } catch (registroError) {
            console.error("Error al registrar usuario:", registroError);
            setError(registroError.message ?? "No se pudo registrar el usuario.");
        } finally {
            setIsRegistering(false);
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
                            <Text style={styles.label}>Correo electrónico</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Ingrese correo electrónico"
                                placeholderTextColor="#444"
                                keyboardType="email-address"
                                value={correo}
                                onChangeText={setCorreo}
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
                            isRegistering && styles.botonDeshabilitado,
                        ]}
                        onPress={registrarUsuario}
                        disabled={isRegistering}
                    >
                        {isRegistering ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.botonTexto}>
                                Registrarse
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkContainer}
                        onPress={() => navigation.replace("LoginScreen")}
                    >
                        <Text style={styles.linkTexto}>
                            ¿Ya tienes una cuenta?{" "}
                            <Text style={styles.linkTextoDestacado}>
                                Iniciar sesión
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