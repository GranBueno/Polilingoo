import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Text,
    View,
    StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";

import AppNavigator from "./src/navigation/AppNavigator";
import useAppFonts from "./src/hooks/useAppFonts";
import Database from "./src/class/Database";

export default function App() {
    const fontsLoaded = useAppFonts();
    const [databaseReady, setDatabaseReady] = useState(false);
    const [databaseError, setDatabaseError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const prepararBaseDeDatos = async () => {
            try {
                await Database.inicializar();

                if (isMounted) {
                    setDatabaseReady(true);
                }
            } catch (error) {
                console.error("Error al inicializar la base de datos:", error);

                if (isMounted) {
                    setDatabaseError(error);
                }
            }
        };

        prepararBaseDeDatos();

        return () => {
            isMounted = false;
        };
    }, []);

    if (databaseError) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>
                    No se pudo cargar la base de datos.
                </Text>
                <Text style={styles.errorDetailText}>
                    {databaseError.message}
                </Text>
            </View>
        );
    }

    if (!fontsLoaded || !databaseReady) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Cargando Polilingo...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#1C1208",
    },

    loadingText: {
        marginTop: 12,
        color: "#F4EAD0",
        fontSize: 16,
    },

    errorText: {
        color: "#F4EAD0",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },

    errorDetailText: {
        marginTop: 10,
        color: "#F4EAD0",
        fontSize: 14,
        textAlign: "center",
    },
});
