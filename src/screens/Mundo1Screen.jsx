import React, { useCallback, useState } from "react";
import {
    View,
    StyleSheet,
    ImageBackground,
    useWindowDimensions,
    Text,
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
    const [error, setError] = useState("");

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const cargarLecciones = async () => {
                try {
                    setError("");

                    const leccionesMundo = await Database.obtenerLeccionesPorMundo(
                        usuarioId,
                        1
                    );

                    if (isActive) {
                        setLecciones(leccionesMundo);
                    }
                } catch (loadError) {
                    console.error("Error al cargar lecciones:", loadError);

                    if (isActive) {
                        setError("No se pudieron cargar las lecciones.");
                    }
                }
            };

            cargarLecciones();

            return () => {
                isActive = false;
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

    const irALeccion = (lessonData) => {
        if (!lessonData || !lessonData.desbloqueada) {
            return;
        }

        navigation.navigate("LeccionScreen", {
            usuarioId,
            lessonId: lessonData.id,
        });
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
                racha={1}
                energia={4}
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
