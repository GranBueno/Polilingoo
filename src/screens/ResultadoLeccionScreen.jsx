import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Pressable,
    Image,
    useWindowDimensions,
} from "react-native";

import WorldBottomNavbar from "../components/navbar/WorldBottomNavbar";
import { globalStyles } from "../styles/styles";

const COLUMNAS = 11;
const FILAS = 15;

// Toggle manual de desarrollo
const SHOW_GRID = false;

const TOTAL_PREGUNTAS_DEFAULT = 5;

// Área superior donde viven los 3 slips
const STATS_AREA = {
    fila: 3,
    columna: 1,
    filas: 3,
    columnas: 11,
};

// Imagen central del journal
const JOURNAL_AREA = {
    fila: 5,
    columna: 2.5,
    filas: 8,
    columnas: 8,
};

// Botón entre journal y navbar inferior
const RETURN_BUTTON_AREA = {
    fila: 12,
    columna: 3,
    filas: 1,
    columnas: 7,
};

const STATS_GRID = {
    filas: 1,
    columnas: 3,
};

const SLIP_VISUAL_SCALE = {
    width: 1.08,
    height: 1.12,
};

const SLIP_SHADOW = {
    offsetX: 6,
    offsetY: 6,
    opacity: 0.28,
    scale: 1.02,
};

const JOURNAL_VISUAL_SCALE = {
    width: 1.05,
    height: 1.05,
};

const JOURNAL_SHADOW = {
    offsetX: 10,
    offsetY: 12,
    opacity: 0.3,
    scale: 1.02,
};

export default function ResultadoLeccionScreen({ route, navigation }) {
    const { width, height } = useWindowDimensions();

    const resumenLeccion = route?.params?.resumenLeccion ?? {};
    const usuarioId = route?.params?.usuarioId ?? null;
    const lessonId = resumenLeccion.lessonId ?? route?.params?.lessonId ?? 1;

    const totalPreguntas =
        resumenLeccion.totalPreguntas ?? TOTAL_PREGUNTAS_DEFAULT;

    const errores =
        resumenLeccion.errores ?? route?.params?.errores ?? 0;

    const tiempoTotalSegundos =
        resumenLeccion.tiempoTotalSegundos ??
        route?.params?.tiempoTotalSegundos ??
        0;

    const aciertos =
        resumenLeccion.correctas ?? Math.max(0, totalPreguntas - errores);

    const precision =
        resumenLeccion.precision ??
        (totalPreguntas > 0
            ? Math.round((aciertos / totalPreguntas) * 100)
            : 0);

    const terminarLeccion = () => {
        navigation.replace("Mundo1Screen", {
            usuarioId,
        });
    };

    const repetirLeccion = () => {
        navigation.replace("LeccionScreen", {
            usuarioId,
            lessonId,
        });
    };

    const cellWidth = width / COLUMNAS;
    const cellHeight = height / FILAS;

    const getCellStyle = (
        fila,
        columna,
        filasOcupadas = 1,
        columnasOcupadas = 1
    ) => ({
        width: cellWidth * columnasOcupadas,
        height: cellHeight * filasOcupadas,
        top: cellHeight * (fila - 1),
        left: cellWidth * (columna - 1),
    });

    const statsContainerWidth = cellWidth * STATS_AREA.columnas;
    const statsContainerHeight = cellHeight * STATS_AREA.filas;

    const statCellWidth = statsContainerWidth / STATS_GRID.columnas;
    const statCellHeight = statsContainerHeight / STATS_GRID.filas;

    const getStatCellStyle = (index) => ({
        width: statCellWidth,
        height: statCellHeight,
        top: 0,
        left: statCellWidth * index,
    });

    const formatTime = (seconds) => {
        const safeSeconds = Math.max(0, Number(seconds) || 0);
        const minutes = Math.floor(safeSeconds / 60);
        const remainingSeconds = safeSeconds % 60;

        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
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

    const renderStatSlip = (index, titulo, valor) => {
        return (
            <View
                key={titulo}
                style={[
                    styles.statSlipContainer,
                    getStatCellStyle(index),
                ]}
            >
                <View style={styles.statSlipFrame}>
                    <Image
                        source={require("../assets/images/Pergamino_Slip.png")}
                        resizeMode="stretch"
                        style={styles.statSlipShadowImage}
                    />

                    <Image
                        source={require("../assets/images/Pergamino_Slip.png")}
                        resizeMode="stretch"
                        style={styles.statSlipImage}
                    />

                    <View style={styles.statTextLayer}>
                        <Text
                            style={[
                                globalStyles.navbarWorldText,
                                styles.worldText,
                                styles.textBackdrop,
                                styles.statText,
                            ]}
                            numberOfLines={3}
                            adjustsFontSizeToFit
                            minimumFontScale={0.45}
                            includeFontPadding={false}
                        >
                            {`${titulo}\n${valor}`}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <ImageBackground
            source={require("../assets/images/backgrounds/FondoPergaminoLeccion.png")}
            resizeMode="stretch"
            style={styles.background}
        >
            <View style={styles.contentLayer}>
                {/* Slips superiores - Área (fila 1, columna 1), ocupa 3 filas x 11 columnas */}
                <View
                    style={[
                        styles.statsContainer,
                        getCellStyle(
                            STATS_AREA.fila,
                            STATS_AREA.columna,
                            STATS_AREA.filas,
                            STATS_AREA.columnas
                        ),
                    ]}
                >
                    {renderStatSlip(0, "Aciertos", aciertos)}
                    {renderStatSlip(1, "Precisión", `${precision}%`)}
                    {renderStatSlip(2, "Tiempo Usado", formatTime(tiempoTotalSegundos))}
                </View>

                {/* Journal central - Área (fila 5, columna 2.5), ocupa 8 filas x 8 columnas */}
                <View
                    style={[
                        styles.journalContainer,
                        getCellStyle(
                            JOURNAL_AREA.fila,
                            JOURNAL_AREA.columna,
                            JOURNAL_AREA.filas,
                            JOURNAL_AREA.columnas
                        ),
                    ]}
                >
                    <Image
                        source={require("../assets/images/Journal.png")}
                        resizeMode="contain"
                        style={styles.journalShadowImage}
                    />

                    <Image
                        source={require("../assets/images/Journal.png")}
                        resizeMode="contain"
                        style={styles.journalImage}
                    />
                </View>

                {/* Botones de resultado - Área (fila 12, columna 3), ocupa 1 fila x 7 columnas */}
                <View
                    style={[
                        styles.resultButtonsContainer,
                        getCellStyle(
                            RETURN_BUTTON_AREA.fila,
                            RETURN_BUTTON_AREA.columna,
                            RETURN_BUTTON_AREA.filas,
                            RETURN_BUTTON_AREA.columnas
                        ),
                    ]}
                >
                    <Pressable
                        style={({ pressed }) => [
                            styles.resultButton,
                            pressed && styles.resultButtonPressed,
                        ]}
                        onPress={terminarLeccion}
                    >
                        <Text
                            style={[
                                globalStyles.navbarWorldText,
                                styles.worldText,
                                styles.textBackdrop,
                                styles.resultButtonText,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.55}
                            includeFontPadding={false}
                        >
                            Terminar
                        </Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.resultButton,
                            pressed && styles.resultButtonPressed,
                        ]}
                        onPress={repetirLeccion}
                    >
                        <Text
                            style={[
                                globalStyles.navbarWorldText,
                                styles.worldText,
                                styles.textBackdrop,
                                styles.resultButtonText,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.55}
                            includeFontPadding={false}
                        >
                            Repetir
                        </Text>
                    </Pressable>
                </View>
            </View>

            {renderDebugGrid()}

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

    contentLayer: {
        ...StyleSheet.absoluteFillObject,
        position: "absolute",
        zIndex: 2,
    },

    debugGrid: {
        ...StyleSheet.absoluteFillObject,
        position: "absolute",
        zIndex: 20,
    },

    debugCell: {
        position: "absolute",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.7)",
    },

    worldText: {
        textAlign: "center",
        textAlignVertical: "center",
        color: "#2B1A0B",
        width: "100%",
        flexShrink: 1,
    },

    textBackdrop: {
        textShadowColor: "rgba(0,0,0,0.35)",
        textShadowOffset: {
            width: 2,
            height: 2,
        },
        textShadowRadius: 3,
    },

    statsContainer: {
        position: "absolute",
        overflow: "visible",
    },

    statSlipContainer: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
        paddingHorizontal: 4,
    },

    statSlipFrame: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
    },

    statSlipShadowImage: {
        position: "absolute",

        width: `${SLIP_VISUAL_SCALE.width * SLIP_SHADOW.scale * 100}%`,
        height: `${SLIP_VISUAL_SCALE.height * SLIP_SHADOW.scale * 100}%`,

        tintColor: "#000",
        opacity: SLIP_SHADOW.opacity,

        transform: [
            { translateX: SLIP_SHADOW.offsetX },
            { translateY: SLIP_SHADOW.offsetY },
        ],
    },

    statSlipImage: {
        position: "absolute",

        width: `${SLIP_VISUAL_SCALE.width * 100}%`,
        height: `${SLIP_VISUAL_SCALE.height * 100}%`,
    },

    statTextLayer: {
        position: "absolute",

        width: "80%",
        height: "58%",

        justifyContent: "center",
        alignItems: "center",

        overflow: "hidden",
    },

    statText: {
        fontSize: 15,
        lineHeight: 18,
        textAlign: "center",
        textAlignVertical: "center",
    },

    journalContainer: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
    },

    journalShadowImage: {
        position: "absolute",

        width: `${JOURNAL_VISUAL_SCALE.width * JOURNAL_SHADOW.scale * 100}%`,
        height: `${JOURNAL_VISUAL_SCALE.height * JOURNAL_SHADOW.scale * 100}%`,

        tintColor: "#000",
        opacity: JOURNAL_SHADOW.opacity,

        transform: [
            { translateX: JOURNAL_SHADOW.offsetX },
            { translateY: JOURNAL_SHADOW.offsetY },
        ],
    },

    journalImage: {
        position: "absolute",

        width: `${JOURNAL_VISUAL_SCALE.width * 100}%`,
        height: `${JOURNAL_VISUAL_SCALE.height * 100}%`,
    },

    resultButtonsContainer: {
        position: "absolute",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
        gap: 12,
    },

    resultButton: {
        flex: 1,
        height: "82%",

        justifyContent: "center",
        alignItems: "center",

        borderRadius: 16,

        backgroundColor: "rgba(244, 224, 180, 0.78)",

        borderWidth: 1.5,
        borderColor: "rgba(43, 26, 11, 0.75)",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.32,
        shadowRadius: 6,

        elevation: 8,
    },


    resultButtonPressed: {
        transform: [{ scale: 0.96 }],
        opacity: 0.88,
    },

    resultButtonText: {
        fontSize: 18,
        textAlign: "center",
        textAlignVertical: "center",
    },
});