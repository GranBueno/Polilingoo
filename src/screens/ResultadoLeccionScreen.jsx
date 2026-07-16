import React, { useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Pressable,
    Image,
    useWindowDimensions,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";

import WorldBottomNavbar from "../components/navbar/WorldBottomNavbar";
import DebugGrid from "../components/layout/DebugGrid";
import ParchmentSlip from "../components/ParchmentSlip";
import usePlayerState from "../hooks/usePlayerState";
import { MAX_VIDAS } from "../config/gameRules";
import { formatDuration } from "../utils/time";
import { globalStyles } from "../styles/styles";

const COLUMNAS = 11;
const FILAS = 15;

// Toggle manual de desarrollo
const SHOW_GRID = false;

const TOTAL_PREGUNTAS_DEFAULT = 5;

// Título del resultado
const TITLE_AREA = {
    fila: 2,
    columna: 2,
    filas: 1,
    columnas: 9,
};

// Recompensas: dos filas de altura, con medio espacio de columna a cada lado
const REWARDS_AREA = {
    fila: 4,
    columna: 1,
    filas: 2,
    columnas: 11,
    margenHorizontalColumnas: 0.5,
};

const REWARD_SHADOW = {
    offsetX: 4,
    offsetY: 5,
    opacity: 0.3,
};

// Área superior donde viven los 3 slips
const STATS_AREA = {
    fila: 12,
    columna: 1,
    filas: 2,
    columnas: 11,
};

// Imagen central del journal
const JOURNAL_AREA = {
    fila: 4.4,
    columna: 2.5,
    filas: 8,
    columnas: 8,
};


// Botón entre journal y navbar inferior
const RETURN_BUTTON_AREA = {
    fila: 10.5,
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
    const isFocused = useIsFocused();
    const isNavigatingRef = useRef(false);

    const resumenLeccion = route?.params?.resumenLeccion ?? {};
    const usuarioId = route?.params?.usuarioId ?? null;
    const lessonId = resumenLeccion.lessonId ?? route?.params?.lessonId ?? 1;

    const { estadoJugador, setEstadoJugador } = usePlayerState(usuarioId, {
        enabled: isFocused,
        initialState: {
            energia: resumenLeccion.energia ?? MAX_VIDAS,
            rachaActual: resumenLeccion.rachaActual ?? 0,
            cristales: resumenLeccion.recursos?.cristales ?? 0,
            pergaminos: resumenLeccion.recursos?.pergaminos ?? 0,
            segundosParaSiguienteVida:
                resumenLeccion.segundosParaSiguienteVida ?? 0,
        },
        registerActivityOnEnable: false,
    });

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

    const leccionCompletada =
        resumenLeccion.completada === true ||
        resumenLeccion.completada === 1 ||
        resumenLeccion.motivoFinalizacion === "completada";

    const pergaminoObtenido =
        Math.max(0, Number(resumenLeccion.pergaminosGanados) || 0) > 0
            ? 1
            : 0;

    const cristalesObtenidos = Math.max(
        0,
        Number(resumenLeccion.cristalesGanados) || 0
    );

    const terminarLeccion = () => {
        if (isNavigatingRef.current) {
            return;
        }

        isNavigatingRef.current = true;
        navigation.popTo("Mundo1Screen", {
            usuarioId,
        });
    };

    const repetirLeccion = () => {
        if (isNavigatingRef.current || estadoJugador.energia <= 0) {
            return;
        }

        isNavigatingRef.current = true;
        navigation.replace("LeccionScreen", {
            usuarioId,
            lessonId,
        });
    };

    const cellWidth = width / COLUMNAS;
    const cellHeight = height / FILAS;

    const rewardsHorizontalMargin =
        cellWidth * REWARDS_AREA.margenHorizontalColumnas;
    const rewardsContainerWidth =
        cellWidth * REWARDS_AREA.columnas - rewardsHorizontalMargin * 2;
    const rewardColumnWidth = rewardsContainerWidth / 2;
    const rewardImageSize = Math.min(
        cellHeight * REWARDS_AREA.filas * 0.68,
        rewardColumnWidth * 0.48
    );
    const rewardTextSize = Math.max(18, Math.min(30, cellHeight * 0.48));
    const resultTitleSize = Math.max(26, Math.min(40, cellHeight * 0.7));

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

    const renderRewardItem = (source, cantidad, accessibilityLabel) => {
        return (
            <View style={styles.rewardItem}>
                <View
                    style={[
                        styles.rewardImageFrame,
                        { width: rewardImageSize, height: rewardImageSize },
                    ]}
                >
                    <Image
                        source={source}
                        resizeMode="contain"
                        accessible={false}
                        style={[
                            styles.rewardShadowImage,
                            { width: rewardImageSize, height: rewardImageSize },
                        ]}
                    />

                    <Image
                        source={source}
                        resizeMode="contain"
                        accessibilityLabel={accessibilityLabel}
                        style={[
                            styles.rewardImage,
                            { width: rewardImageSize, height: rewardImageSize },
                        ]}
                    />
                </View>

                <Text
                    style={[
                        globalStyles.navbarWorldText,
                        styles.rewardAmountText,
                        styles.textBackdrop,
                        { fontSize: rewardTextSize },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                    includeFontPadding={false}
                >
                    {`x${cantidad}`}
                </Text>
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
                <ParchmentSlip
                    visualScale={SLIP_VISUAL_SCALE}
                    shadow={SLIP_SHADOW}
                    contentStyle={styles.statTextLayer}
                >
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
                </ParchmentSlip>
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
                    {renderStatSlip(
                        2,
                        "Tiempo Usado",
                        formatDuration(tiempoTotalSegundos, {
                            showHours: false,
                        })
                    )}
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

                {/* Título: fila 2, centrado */}
                <View
                    style={[
                        styles.resultTitleContainer,
                        getCellStyle(
                            TITLE_AREA.fila,
                            TITLE_AREA.columna,
                            TITLE_AREA.filas,
                            TITLE_AREA.columnas
                        ),
                    ]}
                >
                    <Text
                        style={[
                            globalStyles.navbarWorldText,
                            styles.resultTitleText,
                            styles.textBackdrop,
                            { fontSize: resultTitleSize },
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.65}
                        includeFontPadding={false}
                    >
                        {leccionCompletada ? "¡Éxito!" : "Fallido..."}
                    </Text>
                </View>

                {/* Recompensas: fila 4, dos filas de altura y dos columnas internas */}
                <View
                    style={[
                        styles.rewardsContainer,
                        {
                            width: rewardsContainerWidth,
                            height: cellHeight * REWARDS_AREA.filas,
                            top: cellHeight * (REWARDS_AREA.fila - 1),
                            left:
                                cellWidth * (REWARDS_AREA.columna - 1) +
                                rewardsHorizontalMargin,
                        },
                    ]}
                >
                    {renderRewardItem(
                        require("../assets/images/Pergamino_reward.png"),
                        pergaminoObtenido,
                        "Pergamino obtenido"
                    )}

                    {renderRewardItem(
                        require("../assets/images/cristales_reward.png"),
                        cristalesObtenidos,
                        "Cristales obtenidos"
                    )}
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
                        disabled={estadoJugador.energia <= 0}
                        style={({ pressed }) => [
                            styles.resultButton,
                            estadoJugador.energia <= 0 &&
                                styles.resultButtonDisabled,
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
                            {estadoJugador.energia <= 0
                                ? "Sin vidas"
                                : "Repetir"}
                        </Text>
                    </Pressable>
                </View>
            </View>

            <WorldBottomNavbar
                racha={estadoJugador.rachaActual}
                usuarioId={usuarioId}
                energia={estadoJugador.energia}
                cristales={estadoJugador.cristales}
                segundosParaSiguienteVida={estadoJugador.segundosParaSiguienteVida}
                onEstadoJugadorChange={setEstadoJugador}
            />

            <DebugGrid
                visible={SHOW_GRID}
                rows={FILAS}
                columns={COLUMNAS}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
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

    resultTitleContainer: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 6,
    },

    resultTitleText: {
        width: "100%",
        color: "#2B1A0B",
        textAlign: "center",
        textAlignVertical: "center",
    },

    rewardsContainer: {
        position: "absolute",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        overflow: "visible",
        zIndex: 6,
    },

    rewardItem: {
        flex: 1,
        height: "100%",
        minWidth: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
        paddingHorizontal: 4,
    },

    rewardImageFrame: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
        flexShrink: 0,
    },

    rewardShadowImage: {
        position: "absolute",
        tintColor: "#000",
        opacity: REWARD_SHADOW.opacity,
        transform: [
            { translateX: REWARD_SHADOW.offsetX },
            { translateY: REWARD_SHADOW.offsetY },
        ],
    },

    rewardImage: {
        position: "absolute",
    },

    rewardAmountText: {
        width: "auto",
        maxWidth: "42%",
        marginLeft: 6,
        color: "#2B1A0B",
        textAlign: "center",
        textAlignVertical: "center",
        flexShrink: 1,
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

    resultButtonDisabled: {
        opacity: 0.5,
    },

    resultButtonText: {
        fontSize: 18,
        textAlign: "center",
        textAlignVertical: "center",
    },
});
