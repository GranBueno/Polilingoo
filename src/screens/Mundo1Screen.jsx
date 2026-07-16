import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    StyleSheet,
    ImageBackground,
    useWindowDimensions,
    Text,
    Pressable,
    Modal,
} from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";

import WorldTopNavbar from "../components/navbar/WorldTopNavbar";
import WorldBottomNavbar from "../components/navbar/WorldBottomNavbar";
import LessonButton from "../components/LessonButton";
import DebugGrid from "../components/layout/DebugGrid";
import Database from "../class/Database";
import usePlayerState from "../hooks/usePlayerState";
import { DURACION_MENSAJE_MS } from "../config/gameRules";
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
    const isFocused = useIsFocused();

    const [lecciones, setLecciones] = useState([]);
    const isOpeningLessonRef = useRef(false);
    const {
        estadoJugador,
        setEstadoJugador,
        refreshEstadoJugador,
        playerError,
    } = usePlayerState(usuarioId, {
        enabled: isFocused,
        registerActivityOnEnable: true,
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (!error) {
            return undefined;
        }

        const timeout = setTimeout(
            () => setError(""),
            DURACION_MENSAJE_MS
        );
        return () => clearTimeout(timeout);
    }, [error]);

    useEffect(() => {
        if (playerError) {
            setError("No se pudieron cargar los datos del jugador.");
        }
    }, [playerError]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const cargarDatos = async () => {
                try {
                    setError("");
                    const leccionesMundo =
                        await Database.obtenerLeccionesPorMundo(usuarioId, 1);

                    if (isActive) {
                        setLecciones(leccionesMundo);
                    }
                } catch (loadError) {
                    console.error("Error al cargar datos del mundo:", loadError);

                    if (isActive) {
                        setError("No se pudieron cargar los datos del jugador.");
                    }
                }
            };

            cargarDatos();

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

    const irALeccion = async (lessonData) => {
        if (
            isOpeningLessonRef.current ||
            !lessonData ||
            !lessonData.desbloqueada
        ) {
            return;
        }

        isOpeningLessonRef.current = true;

        try {
            const datosJugador = await refreshEstadoJugador({
                registrarActividad: false,
            });

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
        } finally {
            isOpeningLessonRef.current = false;
        }
    };

    const renderLessonButtons = () => {
        return LESSON_POSITIONS.map((position, index) => {
            const leccion =
                lecciones.find((item) => item.orden === index + 1) ?? null;
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
            <DebugGrid
                visible={SHOW_GRID}
                rows={FILAS}
                columns={COLUMNAS}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
                zIndex={1}
            />

            <View style={styles.lessonLayer}>
                {renderLessonButtons()}


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

            <Modal
                visible={Boolean(error)}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setError("")}
            >
                <Pressable
                    style={styles.noticeOverlay}
                    onPress={() => setError("")}
                >
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
                </Pressable>
            </Modal>

            <WorldBottomNavbar
                racha={estadoJugador.rachaActual}
                usuarioId={usuarioId}
                energia={estadoJugador.energia}
                cristales={estadoJugador.cristales}
                segundosParaSiguienteVida={estadoJugador.segundosParaSiguienteVida}
                onEstadoJugadorChange={setEstadoJugador}
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

    noticeOverlay: {
        ...StyleSheet.absoluteFillObject,
        position: "absolute",
        zIndex: 300,
        elevation: 300,
        backgroundColor: "rgba(20, 13, 8, 0.30)",
        justifyContent: "center",
        alignItems: "center",
    },

    errorContainer: {
        width: "84%",
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
