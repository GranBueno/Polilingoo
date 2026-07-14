import React, { useCallback, useState } from "react";
import {
    View,
    StyleSheet,
    ImageBackground,
    useWindowDimensions,
    Text,
    AppState,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import WorldTopNavbar from "../components/navbar/WorldTopNavbar";
import WorldBottomNavbar from "../components/navbar/WorldBottomNavbar";
import LessonButton from "../components/LessonButton";
import Database from "../class/Database";
import { globalStyles } from "../styles/styles";

const COLUMNAS = 8;
const FILAS = 16;

// Toggle manual de desarrollo
// true = muestra la cuadrícula
// false = oculta la cuadrícula
const SHOW_GRID = false;

const LESSON_POSITIONS = [
    { fila: 5, columna: 3 },
    { fila: 6, columna: 6 },
    { fila: 8, columna: 5 },
    { fila: 10, columna: 6 },
    { fila: 13, columna: 5 },
];

export default function Mundo1Screen({ route, navigation }) {
    const { width, height } = useWindowDimensions();
    const usuarioId = route?.params?.usuarioId ?? null;

    const [lecciones, setLecciones] = useState([]);
    const [estadoJugador, setEstadoJugador] = useState({
        energia: 4,
        rachaActual: 0,
        cristales: 0,
        pergaminos: 0,
    });
    const [error, setError] = useState("");

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const cargarDatos = async () => {
                try {
                    setError("");

                    const [leccionesMundo, datosJugador] = await Promise.all([
                        Database.obtenerLeccionesPorMundo(usuarioId, 1),
                        Database.obtenerEstadoJugador(usuarioId),
                    ]);

                    if (isActive) {
                        setLecciones(leccionesMundo);
                        setEstadoJugador(datosJugador);
                    }
                } catch (loadError) {
                    console.error("Error al cargar datos del mundo:", loadError);

                    if (isActive) {
                        setError("No se pudieron cargar los datos del jugador.");
                    }
                }
            };

            cargarDatos();

            const refreshInterval = setInterval(cargarDatos, 30000);
            const appStateSubscription = AppState.addEventListener(
                "change",
                (nextState) => {
                    if (nextState === "active") {
                        cargarDatos();
                    }
                }
            );

            return () => {
                isActive = false;
                clearInterval(refreshInterval);
                appStateSubscription.remove();
            };
        }, [usuarioId])
    );

    const cellWidth = width / COLUMNAS;
    const cellHeight = height / FILAS;

    const getCellStyle = (fila, columna) => ({
        width: cellWidth,
        height: cellHeight,
        top: cellHeight * (fila - 1),
        left: cellWidth * (columna - 1),
    });

    const irALeccion = async (lessonData) => {
        if (!lessonData || !lessonData.desbloqueada) {
            return;
        }

        try {
            const datosJugador = await Database.obtenerEstadoJugador(
                usuarioId,
                { registrarActividad: false }
            );

            setEstadoJugador(datosJugador);

            if (datosJugador.energia <= 0) {
                setError(
                    "No tienes vidas disponibles. Recuperarás una vida cada 30 minutos."
                );
                return;
            }

            setError("");
            navigation.navigate("LeccionScreen", {
                usuarioId,
                lessonId: lessonData.id,
            });
        } catch (loadError) {
            console.error("Error al comprobar las vidas:", loadError);
            setError("No se pudo comprobar el saldo de vidas.");
        }
    };

    const renderDebugGrid = () => {
        if (!SHOW_GRID) {
            return null;
        }

        const cells = [];

        for (let fila = 1; fila <= FILAS; fila++) {
            for (let columna = 1; columna <= COLUMNAS; columna++) {
                cells.push(
                    <View
                        key={`fila-${fila}-columna-${columna}`}
                        style={[
                            styles.debugCell,
                            getCellStyle(fila, columna),
                        ]}
                    />
                );
            }
        }

        return (
            <View pointerEvents="none" style={styles.debugGrid}>
                {cells}
            </View>
        );
    };

    const renderLessonButtons = () => {
        return LESSON_POSITIONS.map((position, index) => {
            const leccion = lecciones[index] ?? null;
            const lessonNumber = leccion?.orden ?? index + 1;
            const isLocked = !leccion || leccion.desbloqueada !== 1;

            return (
                <View
                    key={`leccion-${lessonNumber}`}
                    style={[styles.cell, getCellStyle(position.fila, position.columna)]}
                >
                    <LessonButton
                        lessonNumber={lessonNumber}
                        lessonData={leccion}
                        isLocked={isLocked}
                        onPress={irALeccion}
                    />
                </View>
            );
        });
    };

    return (
        <ImageBackground
            source={require("../assets/images/backgrounds/Fondo1Verde.png")}
            resizeMode="stretch"
            style={styles.background}
        >
            {renderDebugGrid()}

            <View style={styles.lessonLayer}>
                {renderLessonButtons()}

                {error ? (
                    <View style={styles.errorContainer}>
                        <Text
                            style={[
                                globalStyles.navbarWorldText,
                                styles.errorText,
                            ]}
                        >
                            {error}
                        </Text>
                    </View>
                ) : null}
            </View>

            <WorldTopNavbar
                worldName="MUNDO VERDE"
                onPressLeft={() => {
                    console.log("Ir al mundo anterior");
                }}
                onPressRight={() => {
                    console.log("Ir al siguiente mundo");
                }}
            />

            <WorldBottomNavbar
                racha={estadoJugador.rachaActual}
                energia={estadoJugador.energia}
            />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },

    debugGrid: {
        ...StyleSheet.absoluteFillObject,
        position: "absolute",
        zIndex: 1,
    },

    debugCell: {
        position: "absolute",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.75)",
    },

    lessonLayer: {
        ...StyleSheet.absoluteFillObject,
        position: "absolute",
        zIndex: 2,
    },

    cell: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
    },

    errorContainer: {
        position: "absolute",
        top: "46%",
        left: "8%",
        right: "8%",
        padding: 12,
        borderRadius: 14,
        backgroundColor: "rgba(244, 224, 180, 0.82)",
        borderWidth: 1,
        borderColor: "rgba(43, 26, 11, 0.7)",
    },

    errorText: {
        color: "#2B1A0B",
        fontSize: 16,
        textAlign: "center",
    },
});
