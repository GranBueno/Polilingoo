import React, { useEffect, useRef, useState } from "react";
import * as Crypto from "expo-crypto";
import {
    ActivityIndicator,
    AppState,
    ImageBackground,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

import Database from "../class/Database";
import DebugGrid from "../components/layout/DebugGrid";
import ParchmentSlip from "../components/ParchmentSlip";
import WorldBottomNavbar from "../components/navbar/WorldBottomNavbar";
import {
    DURACION_MENSAJE_MS,
    MAX_VIDAS,
    RETRASO_SIGUIENTE_PREGUNTA_MS,
    RETRASO_TINT_RESPUESTA_MS,
    calcularPrecision,
} from "../config/gameRules";
import { globalStyles } from "../styles/styles";
import { shuffleArray } from "../utils/shuffle";

const COLUMNAS = 11;
const FILAS = 15;
const SHOW_GRID = false;

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
    { id: "A", index: 0, fila: 1, columna: 1, filas: 1, columnas: 2 },
    { id: "B", index: 1, fila: 1, columna: 4, filas: 1, columnas: 2 },
    { id: "C", index: 2, fila: 3, columna: 1, filas: 1, columnas: 2 },
    { id: "D", index: 3, fila: 3, columna: 4, filas: 1, columnas: 2 },
];

const INITIAL_PLAYER_STATE = {
    energia: MAX_VIDAS,
    rachaActual: 0,
    cristales: 0,
    pergaminos: 0,
    segundosParaSiguienteVida: 0,
};

const barajarRespuestas = (leccion) => ({
    ...leccion,
    preguntas: (leccion.preguntas ?? []).map((pregunta) => ({
        ...pregunta,
        respuestas: shuffleArray(pregunta.respuestas ?? []),
    })),
});

export default function LeccionScreen({ route, navigation }) {
    const { width, height } = useWindowDimensions();

    const lessonId =
        route?.params?.lessonId ?? route?.params?.lessonData?.id ?? null;
    const usuarioId = route?.params?.usuarioId ?? null;

    const [lessonData, setLessonData] = useState(null);
    const [isLoadingLesson, setIsLoadingLesson] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [estadoJugador, setEstadoJugador] = useState(INITIAL_PLAYER_STATE);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [errores, setErrores] = useState(0);
    const [correctas, setCorrectas] = useState(0);
    const [isWaitingNextQuestion, setIsWaitingNextQuestion] = useState(false);
    const [isLessonFinished, setIsLessonFinished] = useState(false);

    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
    const [selectedAnswerWasCorrect, setSelectedAnswerWasCorrect] =
        useState(null);
    const [showAnswerTint, setShowAnswerTint] = useState(false);

    const [isSavingResult, setIsSavingResult] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [noticeMessage, setNoticeMessage] = useState("");

    const nextQuestionTimerRef = useRef(null);
    const tintTimerRef = useRef(null);
    const isAnswerLockedRef = useRef(false);
    const isSavingRef = useRef(false);
    const preventExitRef = useRef(false);
    const pendingFinalizationRef = useRef(null);
    const lessonAttemptKeyRef = useRef(null);

    const elapsedActiveMsRef = useRef(0);
    const activeStartedAtRef = useRef(null);
    const appStateRef = useRef(AppState.currentState);

    const preguntas = lessonData?.preguntas ?? [];
    const preguntaActual = preguntas[currentQuestionIndex] ?? null;

    const iniciarCronometroActivo = () => {
        if (
            activeStartedAtRef.current === null &&
            appStateRef.current === "active"
        ) {
            activeStartedAtRef.current = Date.now();
        }
    };

    const pausarCronometroActivo = () => {
        if (activeStartedAtRef.current === null) {
            return;
        }

        elapsedActiveMsRef.current +=
            Date.now() - activeStartedAtRef.current;
        activeStartedAtRef.current = null;
    };

    const obtenerTiempoActivoSegundos = () => {
        const tramoActual =
            activeStartedAtRef.current === null
                ? 0
                : Date.now() - activeStartedAtRef.current;

        return Math.max(
            0,
            Math.round((elapsedActiveMsRef.current + tramoActual) / 1000)
        );
    };

    const limpiarTemporizadores = () => {
        if (nextQuestionTimerRef.current) {
            clearTimeout(nextQuestionTimerRef.current);
            nextQuestionTimerRef.current = null;
        }

        if (tintTimerRef.current) {
            clearTimeout(tintTimerRef.current);
            tintTimerRef.current = null;
        }
    };

    useEffect(() => {
        let isMounted = true;

        const cargarLeccion = async () => {
            try {
                setIsLoadingLesson(true);
                setLoadError("");
                setSaveError("");
                setNoticeMessage("");
                limpiarTemporizadores();

                setLessonData(null);
                setCurrentQuestionIndex(0);
                setErrores(0);
                setCorrectas(0);
                setIsWaitingNextQuestion(false);
                setIsLessonFinished(false);
                setSelectedAnswerIndex(null);
                setSelectedAnswerWasCorrect(null);
                setShowAnswerTint(false);

                isAnswerLockedRef.current = false;
                isSavingRef.current = false;
                preventExitRef.current = false;
                pendingFinalizationRef.current = null;
                lessonAttemptKeyRef.current = null;
                elapsedActiveMsRef.current = 0;
                activeStartedAtRef.current = null;

                if (!usuarioId || !lessonId) {
                    throw new Error(
                        "No se proporcionaron los datos necesarios para abrir la lección."
                    );
                }

                lessonAttemptKeyRef.current = Crypto.randomUUID();

                const datosJugador = await Database.obtenerEstadoJugador(
                    usuarioId,
                    { registrarActividad: false }
                );

                if (datosJugador.energia <= 0) {
                    throw new Error(
                        "No tienes vidas disponibles. Recuperarás una vida cada 30 minutos."
                    );
                }

                const leccionCargada =
                    await Database.obtenerLeccionParaPantalla(lessonId);

                if (!leccionCargada) {
                    throw new Error("La lección no existe en la base de datos.");
                }

                const leccionPreparada = barajarRespuestas(leccionCargada);

                if (leccionPreparada.preguntas.length === 0) {
                    throw new Error("La lección no contiene preguntas.");
                }

                if (isMounted) {
                    setLessonData(leccionPreparada);
                    setEstadoJugador(datosJugador);
                    iniciarCronometroActivo();
                }
            } catch (error) {
                console.error("Error al cargar la lección:", error);

                if (isMounted) {
                    setLoadError(
                        error?.message ?? "No se pudo cargar la lección."
                    );
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
            limpiarTemporizadores();
            pausarCronometroActivo();
        };
    }, [lessonId, usuarioId]);

    useEffect(() => {
        const subscription = AppState.addEventListener(
            "change",
            (nextState) => {
                if (nextState === "active") {
                    appStateRef.current = nextState;

                    if (lessonData && !isLessonFinished) {
                        iniciarCronometroActivo();
                    }

                    return;
                }

                pausarCronometroActivo();
                appStateRef.current = nextState;
            }
        );

        return () => subscription.remove();
    }, [isLessonFinished, lessonData]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("beforeRemove", (event) => {
            if (!preventExitRef.current) {
                return;
            }

            event.preventDefault();
            setNoticeMessage(
                isSavingRef.current
                    ? "Espera mientras se guarda tu progreso."
                    : "Espera a que termine la respuesta actual."
            );
        });

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (!noticeMessage) {
            return undefined;
        }

        const timeout = setTimeout(
            () => setNoticeMessage(""),
            DURACION_MENSAJE_MS
        );

        return () => clearTimeout(timeout);
    }, [noticeMessage]);

    const cellWidth = width / COLUMNAS;
    const cellHeight = height / FILAS;
    const backButtonSize = 44;

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

    const salirAlMundo = () => {
        if (preventExitRef.current) {
            setNoticeMessage(
                isSavingRef.current
                    ? "Espera mientras se guarda tu progreso."
                    : "Espera a que termine la respuesta actual."
            );
            return;
        }

        pausarCronometroActivo();
        navigation.popTo("Mundo1Screen", { usuarioId });
    };

    const abandonarResultadoSinGuardar = () => {
        isSavingRef.current = false;
        preventExitRef.current = false;
        pendingFinalizationRef.current = null;
        setSaveError("");
        navigation.popTo("Mundo1Screen", { usuarioId });
    };

    const guardarResultadoFinal = async (finalizacion) => {
        if (!finalizacion || isSavingRef.current) {
            return;
        }

        isSavingRef.current = true;
        preventExitRef.current = true;
        setIsSavingResult(true);
        setSaveError("");

        try {
            const resultadoProgreso = await Database.finalizarLeccion(
                finalizacion.parametros
            );

            const resumenLeccion = {
                ...finalizacion.resumenBase,
                precision: resultadoProgreso.precision,
                completada: resultadoProgreso.completada,
                motivoFinalizacion:
                    resultadoProgreso.motivoFinalizacion,
                cristalesGanados: resultadoProgreso.cristalesGanados,
                pergaminosGanados: resultadoProgreso.pergaminosGanados,
                recursos: resultadoProgreso.recursos,
                siguienteLeccion: resultadoProgreso.siguienteLeccion,
                siguienteLeccionDesbloqueada:
                    resultadoProgreso.siguienteLeccionDesbloqueada,
            };

            pendingFinalizationRef.current = null;
            isSavingRef.current = false;
            preventExitRef.current = false;
            setIsSavingResult(false);

            navigation.replace("ResultadoLeccionScreen", {
                resumenLeccion,
                lessonId: finalizacion.parametros.leccionId,
                usuarioId,
            });
        } catch (error) {
            console.error("Error al guardar progreso:", error);
            isSavingRef.current = false;
            setIsSavingResult(false);
            setSaveError(
                "No se pudo guardar el resultado. Puedes reintentar sin repetir la lección."
            );
        }
    };

    const handleRespuesta = async (respuesta, respuestaIndex) => {
        if (isAnswerLockedRef.current || isLessonFinished || !preguntaActual) {
            return;
        }

        isAnswerLockedRef.current = true;
        preventExitRef.current = true;
        setIsWaitingNextQuestion(true);

        const esCorrecta = respuesta?.validez === true;
        let sinVidas = false;
        let energiaDespuesRespuesta = estadoJugador.energia;
        let segundosParaSiguienteVida =
            estadoJugador.segundosParaSiguienteVida ?? 0;

        if (!esCorrecta) {
            try {
                const resultadoVida = await Database.descontarVida(usuarioId);
                sinVidas = resultadoVida.sinVidas;
                energiaDespuesRespuesta = resultadoVida.energia;
                segundosParaSiguienteVida =
                    resultadoVida.segundosParaSiguienteVida ?? 0;

                setEstadoJugador((estadoAnterior) => ({
                    ...estadoAnterior,
                    energia: resultadoVida.energia,
                    segundosParaSiguienteVida,
                }));
            } catch (error) {
                console.error("Error al descontar una vida:", error);
                setNoticeMessage(
                    "No se pudo actualizar el sistema de vidas. Intenta responder de nuevo."
                );
                setIsWaitingNextQuestion(false);
                isAnswerLockedRef.current = false;
                preventExitRef.current = false;
                return;
            }
        }

        setSelectedAnswerIndex(respuestaIndex);
        setSelectedAnswerWasCorrect(esCorrecta);
        setShowAnswerTint(false);

        const erroresFinales = errores + (esCorrecta ? 0 : 1);
        const correctasFinales = correctas + (esCorrecta ? 1 : 0);

        setErrores(erroresFinales);
        setCorrectas(correctasFinales);

        tintTimerRef.current = setTimeout(() => {
            setShowAnswerTint(true);
        }, RETRASO_TINT_RESPUESTA_MS);

        nextQuestionTimerRef.current = setTimeout(() => {
            const esUltimaPregunta =
                currentQuestionIndex >= preguntas.length - 1;
            const debeFinalizar = esUltimaPregunta || sinVidas;

            if (!debeFinalizar) {
                setCurrentQuestionIndex((currentIndex) => currentIndex + 1);
                setIsWaitingNextQuestion(false);
                setSelectedAnswerIndex(null);
                setSelectedAnswerWasCorrect(null);
                setShowAnswerTint(false);

                isAnswerLockedRef.current = false;
                preventExitRef.current = false;
                return;
            }

            const tiempoTotalSegundos = obtenerTiempoActivoSegundos();
            pausarCronometroActivo();

            const leccionCompletada = !sinVidas;
            const preguntasRespondidas = currentQuestionIndex + 1;
            const motivoFinalizacion = leccionCompletada
                ? "completada"
                : "sin_vidas";

            const finalizacion = {
                parametros: {
                    usuarioId,
                    leccionId: lessonData.id,
                    correctas: correctasFinales,
                    errores: erroresFinales,
                    totalPreguntas: preguntas.length,
                    preguntasRespondidas,
                    tiempoTotalSegundos,
                    completada: leccionCompletada,
                    motivoFinalizacion,
                    claveIntento: lessonAttemptKeyRef.current,
                },
                resumenBase: {
                    lessonId: lessonData.id,
                    lessonName: lessonData.nombre,
                    totalPreguntas: preguntas.length,
                    preguntasRespondidas,
                    correctas: correctasFinales,
                    errores: erroresFinales,
                    tiempoTotalSegundos,
                    precision: calcularPrecision(
                        correctasFinales,
                        preguntas.length
                    ),
                    completada: leccionCompletada,
                    motivoFinalizacion,
                    cristalesGanados: 0,
                    pergaminosGanados: 0,
                    recursos: {
                        cristales: estadoJugador.cristales,
                        pergaminos: estadoJugador.pergaminos,
                    },
                    energia: energiaDespuesRespuesta,
                    segundosParaSiguienteVida,
                    rachaActual: estadoJugador.rachaActual,
                    siguienteLeccion: null,
                    siguienteLeccionDesbloqueada: false,
                },
            };

            pendingFinalizationRef.current = finalizacion;
            setIsLessonFinished(true);
            setIsWaitingNextQuestion(false);
            guardarResultadoFinal(finalizacion);
        }, RETRASO_SIGUIENTE_PREGUNTA_MS);
    };

    const renderAnswerOption = (layout) => {
        const respuesta = preguntaActual?.respuestas?.[layout.index];

        if (!respuesta) {
            return null;
        }

        const tintColor =
            showAnswerTint && selectedAnswerIndex === layout.index
                ? selectedAnswerWasCorrect
                    ? "rgba(58, 150, 75, 0.28)"
                    : "rgba(150, 45, 38, 0.28)"
                : null;

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
                    (isWaitingNextQuestion || isLessonFinished) &&
                        styles.answerWaiting,
                ]}
                onPress={() => handleRespuesta(respuesta, layout.index)}
            >
                <ParchmentSlip
                    visualScale={SLIP_VISUAL_SCALE}
                    shadow={SLIP_SHADOW}
                    contentStyle={styles.answerTextLayer}
                    tintColor={tintColor}
                >
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
                        {respuesta.texto ?? ""}
                    </Text>
                </ParchmentSlip>
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
                        onPress={salirAlMundo}
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

            <DebugGrid
                visible={SHOW_GRID}
                rows={FILAS}
                columns={COLUMNAS}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
            />

            <WorldBottomNavbar
                racha={estadoJugador.rachaActual}
                usuarioId={usuarioId}
                energia={estadoJugador.energia}
                cristales={estadoJugador.cristales}
                segundosParaSiguienteVida={
                    estadoJugador.segundosParaSiguienteVida
                }
                onEstadoJugadorChange={(nuevoEstado) =>
                    setEstadoJugador((actual) => ({
                        ...actual,
                        ...nuevoEstado,
                    }))
                }
            />

            <Modal
                visible={isSavingResult || Boolean(saveError)}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => {
                    if (saveError) {
                        setNoticeMessage(
                            "Reintenta guardar o elige salir sin guardar."
                        );
                    }
                }}
            >
                <View style={styles.saveOverlay}>
                    <View style={styles.saveBox}>
                        <Text
                            style={[
                                globalStyles.navbarWorldText,
                                styles.saveTitle,
                            ]}
                        >
                            {isSavingResult
                                ? "Guardando progreso..."
                                : "No se pudo guardar"}
                        </Text>

                        {isSavingResult ? (
                            <ActivityIndicator size="large" />
                        ) : (
                            <>
                                <Text
                                    style={[
                                        globalStyles.text,
                                        styles.saveMessage,
                                    ]}
                                >
                                    {saveError}
                                </Text>

                                <View style={styles.saveButtonRow}>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.saveButton,
                                            pressed && styles.saveButtonPressed,
                                        ]}
                                        onPress={() =>
                                            guardarResultadoFinal(
                                                pendingFinalizationRef.current
                                            )
                                        }
                                    >
                                        <Text
                                            style={[
                                                globalStyles.navbarWorldText,
                                                styles.saveButtonText,
                                            ]}
                                        >
                                            Reintentar
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.saveButton,
                                            styles.exitButton,
                                            pressed && styles.saveButtonPressed,
                                        ]}
                                        onPress={abandonarResultadoSinGuardar}
                                    >
                                        <Text
                                            style={[
                                                globalStyles.navbarWorldText,
                                                styles.saveButtonText,
                                            ]}
                                        >
                                            Salir sin guardar
                                        </Text>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal
                visible={Boolean(noticeMessage)}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setNoticeMessage("")}
            >
                <Pressable
                    style={styles.noticeOverlay}
                    onPress={() => setNoticeMessage("")}
                >
                    <View style={styles.noticeBox}>
                        <Text
                            style={[
                                globalStyles.navbarWorldText,
                                styles.noticeText,
                            ]}
                        >
                            {noticeMessage}
                        </Text>
                    </View>
                </Pressable>
            </Modal>
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
        textShadowOffset: { width: 2, height: 2 },
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
    answerTextLayer: {
        width: "86%",
        height: "72%",
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
        shadowOffset: { width: 0, height: 4 },
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
        marginTop: 12,
    },
    saveOverlay: {
        flex: 1,
        backgroundColor: "rgba(20, 13, 8, 0.46)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    saveBox: {
        width: "100%",
        maxWidth: 420,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: "rgba(43, 26, 11, 0.78)",
        backgroundColor: "rgba(244, 224, 180, 0.97)",
        paddingVertical: 22,
        paddingHorizontal: 18,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 260,
    },
    saveTitle: {
        color: "#2B1A0B",
        fontSize: 20,
        textAlign: "center",
        marginBottom: 14,
    },
    saveMessage: {
        color: "#3D2615",
        fontSize: 16,
        lineHeight: 21,
        textAlign: "center",
    },
    saveButtonRow: {
        width: "100%",
        flexDirection: "row",
        gap: 10,
        marginTop: 18,
    },
    saveButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "rgba(43, 26, 11, 0.78)",
        backgroundColor: "rgba(111, 23, 23, 0.86)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    exitButton: {
        backgroundColor: "rgba(77, 58, 39, 0.72)",
    },
    saveButtonPressed: {
        opacity: 0.84,
        transform: [{ scale: 0.97 }],
    },
    saveButtonText: {
        color: "#F7E8C6",
        fontSize: 14,
        textAlign: "center",
    },
    noticeOverlay: {
        flex: 1,
        backgroundColor: "rgba(20, 13, 8, 0.30)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    noticeBox: {
        width: "100%",
        maxWidth: 380,
        padding: 16,
        borderRadius: 14,
        backgroundColor: "rgba(244, 224, 180, 0.96)",
        borderWidth: 1.5,
        borderColor: "rgba(43, 26, 11, 0.78)",
    },
    noticeText: {
        color: "#2B1A0B",
        fontSize: 16,
        textAlign: "center",
    },
});
