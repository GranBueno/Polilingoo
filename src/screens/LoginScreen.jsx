import React, { useRef, useState } from "react";

import Database from "../class/Database";
import AuthScreenLayout, {
    AuthTextField,
} from "../components/auth/AuthScreenLayout";

const AUTH_BACKGROUND = require("../../assets/GL_GateOfAngels_DuckVsCrab.jpg");

export default function LoginScreen({ navigation }) {
    const [nombre, setNombre] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const passwordInputRef = useRef(null);
    const isLoggingInRef = useRef(false);

    const iniciarSesion = async () => {
        if (isLoggingInRef.current) {
            return;
        }

        isLoggingInRef.current = true;

        const nombreLimpio = String(nombre ?? "").trim();
        const contrasenaLimpia = String(contrasena ?? "");

        if (!nombreLimpio || !contrasenaLimpia) {
            setError("Ingresa tu usuario y contraseña.");
            isLoggingInRef.current = false;
            return;
        }

        try {
            setIsLoggingIn(true);
            setError("");

            const usuario = await Database.iniciarSesion(
                nombreLimpio,
                contrasenaLimpia
            );

            navigation.replace("Mundo1Screen", {
                usuarioId: usuario.id,
            });
        } catch (loginError) {
            console.error("Error al iniciar sesión:", loginError);
            setError(loginError?.message ?? "No se pudo iniciar sesión.");
        } finally {
            isLoggingInRef.current = false;
            setIsLoggingIn(false);
        }
    };

    return (
        <AuthScreenLayout
            backgroundSource={AUTH_BACKGROUND}
            error={error}
            isSubmitting={isLoggingIn}
            submitLabel="Iniciar sesión"
            onSubmit={iniciarSesion}
            linkPrefix="¿No tienes una cuenta?"
            linkActionLabel="Registrarse"
            onLinkPress={() => navigation.replace("RegistroScreen")}
        >
            <AuthTextField
                label="Usuario"
                placeholder="Ingrese usuario"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
            />

            <AuthTextField
                inputRef={passwordInputRef}
                label="Contraseña"
                placeholder="Ingrese contraseña"
                secureTextEntry
                value={contrasena}
                onChangeText={setContrasena}
                autoCapitalize="none"
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={iniciarSesion}
            />
        </AuthScreenLayout>
    );
}
