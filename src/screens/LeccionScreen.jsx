import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Pressable,
    Image,
    useWindowDimensions,
    ActivityIndicator,
} from "react-native";

import WorldBottomNavbar from "../components/navbar/WorldBottomNavbar";
import { globalStyles } from "../styles/styles";
import Database from "../class/Database";

const COLUMNAS = 11;
const FILAS = 15;

// Toggle manual de desarrollo
const SHOW_GRID = false;

// Posición del contenido principal en la cuadrícula general
const BACK_BUTTON_AREA = {
    fila: 2,
    columna: 2,
    filas: 1,
    columnas: 1,
};

const QUESTION_AREA = {
    fila: 2,
    columna: 3,
    filas: 3,
    columnas: 7,
};

const INSTRUCTION_AREA = {
    fila: 6,
    columna: 3,
    filas: 1,
    columnas: 7,
};

const ANSWERS_AREA = {
    fila: 8,
    columna: 2,
    filas: 5,
    columnas: 9,
};

const ANSWER_GRID = {
    filas: 3,
    columnas: 5,
};

const SLIP_VISUAL_SCALE = {
    width: 1.18,
    height: 1.18,
};

const SLIP_SHADOW = {
    offsetX: 8,
    offsetY: 8,
    opacity: 0.28,
    scale: 1.02,
};

const TEXT_LINES = {
    question: 4,
    instruction: 3,
};

const ANSWER_LAYOUT = [
    {
        id: "A",
        index: 0,
        fila: 1,
        columna: 1,
        filas: 1,
        columnas: 2,
    },
    {
        id: "B",
        index: 1,
        fila: 1,
        columna: 4,
        filas: 1,
        columnas: 2,
    },
    {
        id: "C",
        index: 2,
        fila: 3,
        columna: 1,
        filas: 1,
        columnas: 2,
    },
    {
        id: "D",
        index: 3,
        fila: 3,
        columna: 4,
        filas: 1,
        columnas: 2,
    },
];

export default function LeccionScreen({ route, navigation }) {
    const { width, height } = useWindowDimensions();

    const lessonId = route?.params?.lessonId ?? route?.params?.lessonData?.id ?? 1;
    const usuarioId = route?.params?.usuarioId ?? null;

    const [lessonData, setLessonData] = useState(null);
    const [isLoadingLesson, setIsLoadingLesson] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [errores, setErrores] = useState(0);
    const [correctas, setCorrectas] = useState(0);
    const [isWaitingNextQuestion, setIsWaitingNextQuestion] = useState(false);
    const [isLessonFinished, setIsLessonFinished] = useState(false);

    const startTimeRef = useRef(Date.now());
    const nextQuestionTimerRef = useRef(null);
    const isAnswerLockedRef = useRef(false);

    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
    const [selectedAnswerWasCorrect, setSelectedAnswerWasCorrect] = useState(null);
    const [showAnswerTint, setShowAnswerTint] = useState(false);

    const tintTimerRef = useRef(null);

    const preguntas = lessonData?.preguntas ?? [];
    const preguntaActual = preguntas[currentQuestionIndex] ?? null;

    useEffect(() => {
        let isMounted = true;

        const cargarLeccion = async () => {
            try {
                setIsLoadingLesson(true);
                setLoadError("");

                if (nextQuestionTimerRef.current) {
                    clearTimeout(nextQuestionTimerRef.current);
                }

                if (tintTimerRef.current) {
                    clearTimeout(tintTimerRef.current);
                }

                setCurrentQuestionIndex(0);
                setErrores(0);
                setCorrectas(0);
                setIsWaitingNextQuestion(false);
                setIsLessonFinished(false);
                setSelectedAnswerIndex(null);
                setSelectedAnswerWasCorrect(null);
                setShowAnswerTint(false);
                isAnswerLockedRef.current = false;
                startTimeRef.current = Date.now();

                const leccionCargada = await Database.obtenerLeccionParaPantalla(lessonId);

                if (!leccionCargada) {
                    throw new Error("La lección no existe en la base de datos.");
                }

                if (isMounted) {
                    setLessonData(leccionCargada);
                }
            } catch (error) {
                console.error("Error al cargar la lección:", error);

                if (isMounted) {
                    setLoadError(error.message ?? "No se pudo cargar la lección.");
                }
            } finally {
                if (isMounted) {
                    setIsLoadingLesson(false);
                }
            }
        };

        cargarLeccion();

        return () => {
            isMounted = false;
        };
    }, [lessonId]);

    useEffect(() => {
        return () => {
            if (nextQuestionTimerRef.current) {
                clearTimeout(nextQuestionTimerRef.current);
            }

            if (tintTimerRef.current) {
                clearTimeout(tintTimerRef.current);
            }
        };
    }, []);

    const cellWidth = width / COLUMNAS;
    const cellHeight = height / FILAS;
    const backButtonSize = Math.min(cellWidth, cellHeight) * 0.7;

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

    const answersContainerWidth = cellWidth * ANSWERS_AREA.columnas;
    const answersContainerHeight = cellHeight * ANSWERS_AREA.filas;

    const answerCellWidth = answersContainerWidth / ANSWER_GRID.columnas;
    const answerCellHeight = answersContainerHeight / ANSWER_GRID.filas;

    const getAnswerCellStyle = (
        fila,
        columna,
        filasOcupadas = 1,
        columnasOcupadas = 1
    ) => ({
        width: answerCellWidth * columnasOcupadas,
        height: answerCellHeight * filasOcupadas,
        top: answerCellHeight * (fila - 1),
        left: answerCellWidth * (columna - 1),
    });

    const obtenerTextoRespuesta = (respuesta) => {
        if (typeof respuesta === "string") {
            return respuesta;
        }

        return respuesta?.texto ?? "";
    };

    const respuestaEsCorrecta = (respuesta) => {
        if (!respuesta || !preguntaActual) {
            return false;
        }

        if (typeof respuesta === "string") {
            return respuesta === preguntaActual.respuestaCorrecta;
        }

        return respuesta.validez === true || respuesta.id === preguntaActual.respuestaCorrectaId;
    };

    const handleRespuesta = (respuesta, respuestaIndex) => {
        if (isAnswerLockedRef.current || isLessonFinished || !preguntaActual) {
            return;
        }

        isAnswerLockedRef.current = true;
        setIsWaitingNextQuestion(true);

        const esCorrecta = respuestaEsCorrecta(respuesta);

        setSelectedAnswerIndex(respuestaIndex);
        setSelectedAnswerWasCorrect(esCorrecta);
        setShowAnswerTint(false);

        const erroresFinales = errores + (esCorrecta ? 0 : 1);
        const correctasFinales = correctas + (esCorrecta ? 1 : 0);

        setErrores(erroresFinales);
        setCorrectas(correctasFinales);

        console.log("Respuesta seleccionada:", obtenerTextoRespuesta(respuesta));
        console.log(esCorrecta ? "Respuesta correcta" : "Respuesta incorrecta");

        // Primeros 2 segundos: solo se mantiene el bloqueo/tint normal.
        // Último segundo: se muestra el tint verde o rojo en la respuesta elegida.
        tintTimerRef.current = setTimeout(() => {
            setShowAnswerTint(true);
        }, 2000);

        nextQuestionTimerRef.current = setTimeout(async () => {
            const esUltimaPregunta = currentQuestionIndex >= preguntas.length - 1;

            if (!esUltimaPregunta) {
                setCurrentQuestionIndex((prevIndex) => prevIndex + 1);

                setIsWaitingNextQuestion(false);
                setSelectedAnswerIndex(null);
                setSelectedAnswerWasCorrect(null);
                setShowAnswerTint(false);

                isAnswerLockedRef.current = false;
                return;
            }

            const tiempoTotalSegundos = Math.round(
                (Date.now() - startTimeRef.current) / 1000
            );

            let resultadoProgreso = {
                precision: preguntas.length > 0
                    ? Math.round((correctasFinales / preguntas.length) * 100)
                    : 0,
                siguienteLeccion: null,
                siguienteLeccionDesbloqueada: false,
            };

            try {
                if (usuarioId) {
                    resultadoProgreso = await Database.finalizarLeccion({
                        usuarioId,
                        leccionId: lessonData.id,
                        correctas: correctasFinales,
                        errores: erroresFinales,
                        totalPreguntas: preguntas.length,
                        tiempoTotalSegundos,
                    });
                }
            } catch (saveError) {
                console.error("Error al guardar progreso:", saveError);
            }

            const resumenLeccion = {
                lessonId: lessonData.id,
                lessonName: lessonData.nombre,
                totalPreguntas: preguntas.length,
                correctas: correctasFinales,
                errores: erroresFinales,
                tiempoTotalSegundos,
                precision: resultadoProgreso.precision,
                siguienteLeccion: resultadoProgreso.siguienteLeccion,
                siguienteLeccionDesbloqueada: resultadoProgreso.siguienteLeccionDesbloqueada,
            };

            console.log("Resumen de lección:", resumenLeccion);

            setIsLessonFinished(true);
            setIsWaitingNextQuestion(false);

            navigation.replace("ResultadoLeccionScreen", {
                resumenLeccion,
                lessonId: lessonData.id,
                usuarioId,
            });
        }, 3000);
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

    const renderAnswerOption = (layout) => {
        const respuesta = preguntaActual?.respuestas?.[layout.index];

        if (!respuesta) {
            return null;
        }

        return (
            <Pressable
                key={layout.id}
                disabled={isWaitingNextQuestion || isLessonFinished}
                style={({ pressed }) => [
                    styles.answerOption,
                    getAnswerCellStyle(
                        layout.fila,
                        layout.columna,
                        layout.filas,
                        layout.columnas
                    ),
                    pressed && styles.answerPressed,
                    isWaitingNextQuestion && styles.answerWaiting,
                    isLessonFinished && styles.answerWaiting,
                ]}
                onPress={() => handleRespuesta(respuesta, layout.index)}
            >
                <View style={styles.slipFrame}>
                    <Image
                        source={require("../assets/images/Pergamino_Slip.png")}
                        resizeMode="stretch"
                        style={styles.slipShadowImage}
                    />

                    <Image
                        source={require("../assets/images/Pergamino_Slip.png")}
                        resizeMode="stretch"
                        style={styles.slipImage}
                    />
                    {showAnswerTint && selectedAnswerIndex === layout.index && (
                        <View
                            pointerEvents="none"
                            style={[
                                styles.answerTintLayer,
                                selectedAnswerWasCorrect
                                    ? styles.answerTintCorrect
                                    : styles.answerTintIncorrect,
                            ]}
                        />
                    )}

                    <View style={styles.answerTextLayer}>
                        <Text
                            style={[
                                globalStyles.navbarWorldText,
                                styles.worldText,
                                styles.textBackdrop,
                                styles.answerText,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.35}
                            ellipsizeMode="clip"
                            includeFontPadding={false}
                        >
                            {obtenerTextoRespuesta(respuesta)}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    };

    const renderLoadingContent = () => {
        const message = loadError || "Cargando lección...";

        return (
            <View style={styles.loadingContainer}>
                {!loadError ? <ActivityIndicator size="large" /> : null}
                <Text
                    style={[
                        globalStyles.navbarWorldText,
                        styles.worldText,
                        styles.textBackdrop,
                        styles.loadingText,
                    ]}
                >
                    {message}
                </Text>
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
                <View
                    style={[
                        styles.backButtonContainer,
                        getCellStyle(
                            BACK_BUTTON_AREA.fila,
                            BACK_BUTTON_AREA.columna,
                            BACK_BUTTON_AREA.filas,
                            BACK_BUTTON_AREA.columnas
                        ),
                    ]}
                >
                    <Pressable
                        style={({ pressed }) => [
                            styles.backButton,
                            {
                                width: backButtonSize,
                                height: backButtonSize,
                                borderRadius: backButtonSize / 2,
                            },
                            pressed && styles.backButtonPressed,
                        ]}
                        onPress={() => {
                            navigation.replace("Mundo1Screen", {
                                usuarioId,
                            });
                        }}
                    >
                        <Text
                            style={[
                                globalStyles.navbarWorldText,
                                styles.worldText,
                                styles.textBackdrop,
                                styles.backButtonText,
                            ]}
                            includeFontPadding={false}
                        >
                            {"<"}
                        </Text>
                    </Pressable>
                </View>

                {isLoadingLesson || loadError || !preguntaActual ? (
                    renderLoadingContent()
                ) : (
                    <>
                        {/* Pregunta */}
                        <View
                            style={[
                                styles.questionContainer,
                                getCellStyle(
                                    QUESTION_AREA.fila,
                                    QUESTION_AREA.columna,
                                    QUESTION_AREA.filas,
                                    QUESTION_AREA.columnas
                                ),
                            ]}
                        >
                            <Text
                                style={[
                                    globalStyles.navbarWorldText,
                                    styles.worldText,
                                    styles.textBackdrop,
                                    styles.questionText,
                                ]}
                                numberOfLines={TEXT_LINES.question}
                                adjustsFontSizeToFit
                                minimumFontScale={0.5}
                                includeFontPadding={false}
                            >
                                {preguntaActual.texto}
                            </Text>
                        </View>

                        {/* Instrucción */}
                        <View
                            style={[
                                styles.instructionContainer,
                                getCellStyle(
                                    INSTRUCTION_AREA.fila,
                                    INSTRUCTION_AREA.columna,
                                    INSTRUCTION_AREA.filas,
                                    INSTRUCTION_AREA.columnas
                                ),
                            ]}
                        >
                            <Text
                                style={[
                                    globalStyles.navbarWorldText,
                                    styles.worldText,
                                    styles.instructionText,
                                ]}
                                numberOfLines={TEXT_LINES.instruction}
                                adjustsFontSizeToFit
                                minimumFontScale={0.55}
                                includeFontPadding={false}
                            >
                                {preguntaActual.instruccion}
                            </Text>
                        </View>

                        {/* Respuestas */}
                        <View
                            style={[
                                styles.answersContainer,
                                getCellStyle(
                                    ANSWERS_AREA.fila,
                                    ANSWERS_AREA.columna,
                                    ANSWERS_AREA.filas,
                                    ANSWERS_AREA.columnas
                                ),
                            ]}
                        >
                            {ANSWER_LAYOUT.map(renderAnswerOption)}
                        </View>
                    </>
                )}
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

    questionContainer: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 8,
        overflow: "hidden",
    },

    questionText: {
        fontSize: 25,
        lineHeight: 30,
    },

    instructionContainer: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 8,
        overflow: "hidden",
    },

    instructionText: {
        fontSize: 16,
        lineHeight: 20,
    },

    answersContainer: {
        position: "absolute",
        overflow: "visible",
    },

    answerOption: {
        position: "absolute",
        overflow: "visible",
    },

    answerPressed: {
        transform: [{ scale: 0.96 }],
        opacity: 0.88,
    },

    answerWaiting: {
        opacity: 0.72,
    },

    slipFrame: {
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
    },

    slipShadowImage: {
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

    slipImage: {
        position: "absolute",

        width: `${SLIP_VISUAL_SCALE.width * 100}%`,
        height: `${SLIP_VISUAL_SCALE.height * 100}%`,
    },

    answerTextLayer: {
        position: "absolute",

        width: "86%",
        height: "72%",

        justifyContent: "center",
        alignItems: "center",

        overflow: "hidden",
    },

    answerText: {
        fontSize: 18,
        textAlign: "center",
        textAlignVertical: "center",
    },

    backButtonContainer: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
    },

    backButton: {
        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "rgba(43, 26, 11, 0.35)",

        borderWidth: 1.5,
        borderColor: "rgba(43, 26, 11, 0.75)",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.35,
        shadowRadius: 5,

        elevation: 8,
    },

    backButtonPressed: {
        transform: [{ scale: 0.92 }],
        opacity: 0.85,
    },

    backButtonText: {
        fontSize: 26,
        textAlign: "center",
        textAlignVertical: "center",
        transform: [{ translateY: -5 }],
    },
    answerTintLayer: {
        position: "absolute",

        width: `${SLIP_VISUAL_SCALE.width * 100}%`,
        height: `${SLIP_VISUAL_SCALE.height * 100}%`,

        borderRadius: 18,
    },

    answerTintCorrect: {
        backgroundColor: "rgba(58, 150, 75, 0.28)",
    },

    answerTintIncorrect: {
        backgroundColor: "rgba(150, 45, 38, 0.28)",
    },

    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        zIndex: 4,
    },

    loadingText: {
        color: "#2B1A0B",
        fontSize: 20,
        textAlign: "center",
    },
});