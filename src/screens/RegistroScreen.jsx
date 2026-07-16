import React, { useRef, useState } from "react";

import Database from "../class/Database";
import Usuario from "../class/Usuarios";
import AuthScreenLayout, {
    AuthTextField,
} from "../components/auth/AuthScreenLayout";

const AUTH_BACKGROUND = require("../../assets/GL_GateOfAngels_DuckVsCrab.jpg");

export default function RegistroScreen({ navigation }) {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const isRegisteringRef = useRef(false);

    const registrarUsuario = async () => {
        if (isRegisteringRef.current) {
            return;
        }

        isRegisteringRef.current = true;

        const usuario = new Usuario(nombre, correo, contrasena);
        const validacion = usuario.validarTodo();

        if (!validacion.valido) {
            setError(validacion.errores[0]);
            isRegisteringRef.current = false;
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
            setError(
                registroError?.message ?? "No se pudo registrar el usuario."
            );
        } finally {
            isRegisteringRef.current = false;
            setIsRegistering(false);
        }
    };

    return (
        <AuthScreenLayout
            backgroundSource={AUTH_BACKGROUND}
            error={error}
            isSubmitting={isRegistering}
            submitLabel="Registrarse"
            onSubmit={registrarUsuario}
            linkPrefix="¿Ya tienes una cuenta?"
            linkActionLabel="Iniciar sesión"
            onLinkPress={() => navigation.replace("LoginScreen")}
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
                onSubmitEditing={() => emailInputRef.current?.focus()}
            />

            <AuthTextField
                inputRef={emailInputRef}
                label="Correo electrónico"
                placeholder="Ingrese correo electrónico"
                keyboardType="email-address"
                value={correo}
                onChangeText={setCorreo}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
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
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={registrarUsuario}
            />
        </AuthScreenLayout>
    );
}
