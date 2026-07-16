import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

import Database from "../../class/Database";
import DebugGrid from "../layout/DebugGrid";
import {
    COSTO_VIDA_CRISTALES,
    DURACION_MENSAJE_MS,
    MAX_VIDAS,
    calcularSegundosParaTodasLasVidas,
} from "../../config/gameRules";
import { formatDuration } from "../../utils/time";
import { globalStyles } from "../../styles/styles";

const GRID_FILAS = 20;
const GRID_COLUMNAS = 10;
const SHOW_POPOVER_GRID = false;

/*
 * Medidas reales de desplegable_Scroll.png:
 * 1086 × 1448 px.
 *
 * El papel visible comienza cerca del 14.9 % del ancho y termina
 * cerca del 85.5 %. La punta visible termina en el 91.37 % de la altura.
 *
 * Estas proporciones permiten colocar la punta sobre el corazón aunque
 * el PNG tenga espacio transparente alrededor.
 */
const SCROLL_ASSET = {
    aspectRatio: 1448 / 1086,
    visibleLeftRatio: 162 / 1086,
    visibleRightRatio: 928 / 1086,
    visibleWidthRatio: (928 - 162) / 1086,
    pointerXRatio: 0.5,
    pointerTipYRatio: 1323 / 1448,
};

const POPOVER_TOP_MARGIN = 8;
const POINTER_OVERLAP = 2;

const POPOVER_AREAS = {
    titulo: { fila: 1, columna: 1, filas: 2, columnas: 10 },

    proximaVida: { fila: 3, columna: 1, filas: 4, columnas: 10 },
    separador1: { fila: 7, columna: 1, filas: 1, columnas: 10 },

    vidasCompletasTiempo: {
        fila: 8,
        columna: 1,
        filas: 4,
        columnas: 10,
    },
    separador2: { fila: 12, columna: 1, filas: 1, columnas: 10 },

    comprar: { fila: 13, columna: 1, filas: 4, columnas: 10 },
    separador3: { fila: 17, columna: 1, filas: 1, columnas: 10 },

    cristales: { fila: 18, columna: 1, filas: 3, columnas: 10 },

    fullTitulo: { fila: 6, columna: 1, filas: 4, columnas: 10 },
    fullSeparador: { fila: 10, columna: 1, filas: 1, columnas: 10 },
    fullMensaje: { fila: 11, columna: 1, filas: 4, columnas: 10 },
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function LivesPopover({
    visible,
    usuarioId,
    anchor,
    estadoJugador,
    onClose,
    onEstadoChange,
}) {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const [estadoLocal, setEstadoLocal] = useState(estadoJugador);
    const [segundosSiguiente, setSegundosSiguiente] = useState(
        estadoJugador?.segundosParaSiguienteVida ?? 0
    );
    const [comprando, setComprando] = useState(false);
    const comprandoRef = useRef(false);
    const hasSyncedVisibleStateRef = useRef(false);
    const [mensaje, setMensaje] = useState("");
    const [contentLayout, setContentLayout] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        setEstadoLocal(estadoJugador);
        setSegundosSiguiente(
            estadoJugador?.segundosParaSiguienteVida ?? 0
        );
    }, [estadoJugador]);

    useEffect(() => {
        if (!visible || !usuarioId) {
            hasSyncedVisibleStateRef.current = false;
            return undefined;
        }

        let activo = true;
        hasSyncedVisibleStateRef.current = false;

        Database.obtenerEstadoJugador(usuarioId, {
            registrarActividad: false,
        })
            .then((nuevoEstado) => {
                if (!activo) {
                    return;
                }

                hasSyncedVisibleStateRef.current = true;
                setEstadoLocal(nuevoEstado);
                setSegundosSiguiente(
                    nuevoEstado.segundosParaSiguienteVida ?? 0
                );
                onEstadoChange?.(nuevoEstado);
            })
            .catch((error) => {
                console.error(
                    "No se pudo abrir el contador de vidas:",
                    error
                );
            });

        return () => {
            activo = false;
        };
    }, [usuarioId, visible]);

    useEffect(() => {
        if (
            !visible ||
            (estadoLocal?.energia ?? MAX_VIDAS) >= MAX_VIDAS
        ) {
            return undefined;
        }

        const interval = setInterval(() => {
            setSegundosSiguiente((actual) => Math.max(0, actual - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [visible, estadoLocal?.energia]);

    useEffect(() => {
        if (!mensaje) {
            return undefined;
        }

        const timeout = setTimeout(
            () => setMensaje(""),
            DURACION_MENSAJE_MS
        );
        return () => clearTimeout(timeout);
    }, [mensaje]);

    useEffect(() => {
        if (
            !visible ||
            !hasSyncedVisibleStateRef.current ||
            segundosSiguiente !== 0
        ) {
            return;
        }

        if ((estadoLocal?.energia ?? MAX_VIDAS) >= MAX_VIDAS) {
            return;
        }

        let activo = true;

        const refrescar = async () => {
            try {
                const nuevoEstado = await Database.obtenerEstadoJugador(
                    usuarioId,
                    { registrarActividad: false }
                );

                if (activo) {
                    setEstadoLocal(nuevoEstado);
                    setSegundosSiguiente(
                        nuevoEstado.segundosParaSiguienteVida ?? 0
                    );
                    onEstadoChange?.(nuevoEstado);
                }
            } catch (error) {
                console.error(
                    "No se pudo actualizar el contador de vidas:",
                    error
                );
            }
        };

        refrescar();

        return () => {
            activo = false;
        };
    }, [
        segundosSiguiente,
        visible,
        usuarioId,
        estadoLocal?.energia,
        onEstadoChange,
    ]);

    const vidas = clamp(
        Number(estadoLocal?.energia) || 0,
        0,
        MAX_VIDAS
    );
    const cristales = Math.max(
        0,
        Number(estadoLocal?.cristales) || 0
    );

    const vidasFaltantes = MAX_VIDAS - vidas;
    const vidasCompletas = vidasFaltantes === 0;

    const segundosTodas = useMemo(
        () =>
            calcularSegundosParaTodasLasVidas(
                vidas,
                segundosSiguiente
            ),
        [segundosSiguiente, vidas]
    );

    const comprarVida = async () => {
        if (comprandoRef.current || vidasCompletas) {
            return;
        }

        comprandoRef.current = true;
        setComprando(true);
        setMensaje("");

        try {
            const resultado =
                await Database.comprarUnaVidaConCristales(usuarioId);

            const nuevoEstado = {
                ...estadoLocal,
                energia: resultado.energia,
                cristales: resultado.cristales,
                segundosParaSiguienteVida:
                    resultado.segundosParaSiguienteVida,
            };

            setEstadoLocal(nuevoEstado);
            setSegundosSiguiente(
                resultado.segundosParaSiguienteVida ?? 0
            );
            onEstadoChange?.(nuevoEstado);
        } catch (error) {
            setMensaje(
                error?.code === "CRISTALES_INSUFICIENTES"
                    ? "No tienes suficientes cristales"
                    : error?.message ?? "No se pudo comprar la vida"
            );
        } finally {
            comprandoRef.current = false;
            setComprando(false);
        }
    };

    /*
     * El ancho se calcula usando el rectángulo visible del papel, no el
     * ancho total transparente del PNG. De este modo el pergamino visible
     * ocupa aproximadamente el 92 % de la pantalla.
     */
    const visiblePaperWidth = Math.min(
        clamp(screenWidth * 0.92, 230, 420),
        Math.max(210, screenWidth - 12)
    );

    const requestedPopoverWidth =
        visiblePaperWidth / SCROLL_ASSET.visibleWidthRatio;
    const requestedPopoverHeight =
        requestedPopoverWidth * SCROLL_ASSET.aspectRatio;

    const anchorX = anchor
        ? anchor.x + anchor.width / 2
        : screenWidth / 2;

    const anchorY = anchor
        ? anchor.y + anchor.height / 2
        : screenHeight - 125;

    /*
     * Si la pantalla es pequeña, se reduce todo el pergamino manteniendo
     * su proporción. Así la punta sigue anclada y nunca se corrige la
     * posición con un clamp que vuelva a separarla del corazón.
     */
    const maximumPopoverHeight =
        (anchorY - POPOVER_TOP_MARGIN) /
        SCROLL_ASSET.pointerTipYRatio;

    const popoverScale = Math.min(
        1,
        maximumPopoverHeight / requestedPopoverHeight
    );

    const popoverWidth = requestedPopoverWidth * popoverScale;
    const popoverHeight = requestedPopoverHeight * popoverScale;

    const desiredLeft =
        anchorX - popoverWidth * SCROLL_ASSET.pointerXRatio;

    const minimumLeft =
        6 - popoverWidth * SCROLL_ASSET.visibleLeftRatio;

    const maximumLeft =
        screenWidth -
        6 -
        popoverWidth * SCROLL_ASSET.visibleRightRatio;

    const popoverLeft = clamp(
        desiredLeft,
        minimumLeft,
        maximumLeft
    );

    /*
     * Se usa la coordenada real de la punta visible del asset.
     * POINTER_OVERLAP hace que la punta entre ligeramente en el corazón.
     */
    const popoverTop =
        anchorY -
        popoverHeight * SCROLL_ASSET.pointerTipYRatio +
        POINTER_OVERLAP;

    const getGridStyle = ({
        fila,
        columna,
        filas,
        columnas,
    }) => {
        const cellWidth = contentLayout.width / GRID_COLUMNAS;
        const cellHeight = contentLayout.height / GRID_FILAS;

        return {
            position: "absolute",
            left: cellWidth * (columna - 1),
            top: cellHeight * (fila - 1),
            width: cellWidth * columnas,
            height: cellHeight * filas,
        };
    };

    const renderSeparator = (area) => (
        <View style={[styles.areaCenter, getGridStyle(area)]}>
            <View style={styles.separatorViewport}>
                <Image
                    source={require("../../assets/navbar/separador.png")}
                    resizeMode="cover"
                    style={styles.separatorImage}
                />
            </View>
        </View>
    );

    const renderTimeBlock = (
        area,
        iconSource,
        label,
        value
    ) => (
        <View style={[styles.timeArea, getGridStyle(area)]}>
            <Image
                source={iconSource}
                resizeMode="contain"
                style={styles.timeIcon}
            />

            <View style={styles.timeTextBox}>
                <Text
                    style={[
                        globalStyles.textBold,
                        styles.timeLabel,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.65}
                    includeFontPadding={false}
                >
                    {label}
                </Text>

                <Text
                    style={[globalStyles.text, styles.timeValue]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    includeFontPadding={false}
                >
                    {value}
                </Text>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.modalRoot}>
                <Pressable
                    accessibilityLabel="Cerrar información de vidas"
                    style={styles.dismissLayer}
                    onPress={onClose}
                />

                <View
                    style={[
                        styles.popover,
                        {
                            left: popoverLeft,
                            top: popoverTop,
                            width: popoverWidth,
                            height: popoverHeight,
                        },
                    ]}
                >
                    <Image
                        pointerEvents="none"
                        source={require("../../assets/navbar/desplegable_Scroll.png")}
                        resizeMode="contain"
                        style={styles.popoverBackground}
                    />

                    {/* Absorbe cualquier toque dentro del pergamino. */}
                    <Pressable
                        style={styles.popoverHitShield}
                        onPress={() => {}}
                    />

                    {/*
                     * El grid solo ocupa el rectángulo útil del papel.
                     * Excluye los márgenes transparentes, el borde y la punta.
                     */}
                    <View
                        style={styles.contentGrid}
                        onLayout={(event) =>
                            setContentLayout(
                                event.nativeEvent.layout
                            )
                        }
                    >
                        <View
                            style={[
                                styles.areaCenter,
                                getGridStyle(
                                    POPOVER_AREAS.titulo
                                ),
                            ]}
                        >
                            <Text
                                style={[
                                    globalStyles.title,
                                    styles.title,
                                ]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.7}
                                includeFontPadding={false}
                            >
                                Vidas
                            </Text>
                        </View>

                        {vidasCompletas ? (
                            <>
                                <View
                                    style={[
                                        styles.areaCenter,
                                        getGridStyle(
                                            POPOVER_AREAS.fullTitulo
                                        ),
                                    ]}
                                >
                                    <Text
                                        style={[
                                            globalStyles.subtitle,
                                            styles.fullTitle,
                                        ]}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                        minimumFontScale={0.65}
                                        includeFontPadding={false}
                                    >
                                        Todas las vidas recuperadas
                                    </Text>
                                </View>

                                {renderSeparator(
                                    POPOVER_AREAS.fullSeparador
                                )}

                                <View
                                    style={[
                                        styles.areaCenter,
                                        getGridStyle(
                                            POPOVER_AREAS.fullMensaje
                                        ),
                                    ]}
                                >
                                    <Text
                                        style={[
                                            globalStyles.textBold,
                                            styles.centerText,
                                        ]}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                        minimumFontScale={0.65}
                                        includeFontPadding={false}
                                    >
                                        No necesitas regenerar vidas
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <>
                                {renderTimeBlock(
                                    POPOVER_AREAS.proximaVida,
                                    require("../../assets/navbar/reloj_arena.png"),
                                    "Próxima vida",
                                    formatDuration(
                                        segundosSiguiente
                                    )
                                )}

                                {renderSeparator(
                                    POPOVER_AREAS.separador1
                                )}

                                {renderTimeBlock(
                                    POPOVER_AREAS
                                        .vidasCompletasTiempo,
                                    require("../../assets/navbar/reloj.png"),
                                    "Todas las vidas",
                                    formatDuration(segundosTodas)
                                )}

                                {renderSeparator(
                                    POPOVER_AREAS.separador2
                                )}

                                <View
                                    style={[
                                        styles.areaCenter,
                                        getGridStyle(
                                            POPOVER_AREAS.comprar
                                        ),
                                    ]}
                                >
                                    <Pressable
                                        disabled={comprando}
                                        style={({ pressed }) => [
                                            styles.buyButton,
                                            pressed &&
                                                styles.buyButtonPressed,
                                        ]}
                                        onPress={comprarVida}
                                    >
                                        <Image
                                            pointerEvents="none"
                                            source={require("../../assets/navbar/Boton_rojo.png")}
                                            resizeMode="contain"
                                            style={
                                                styles.buyButtonImage
                                            }
                                        />

                                        <View
                                            pointerEvents="none"
                                            style={
                                                styles.buyButtonTextLayer
                                            }
                                        >
                                            {comprando ? (
                                                <ActivityIndicator size="small" />
                                            ) : (
                                                <>
                                                    <Text
                                                        style={[
                                                            globalStyles.buttonText,
                                                            styles.buyButtonTitle,
                                                        ]}
                                                        numberOfLines={1}
                                                        adjustsFontSizeToFit
                                                        minimumFontScale={
                                                            0.65
                                                        }
                                                        includeFontPadding={
                                                            false
                                                        }
                                                    >
                                                        Comprar una vida
                                                    </Text>

                                                    <Text
                                                        style={[
                                                            globalStyles.textBold,
                                                            styles.buyButtonCost,
                                                        ]}
                                                        numberOfLines={1}
                                                        adjustsFontSizeToFit
                                                        minimumFontScale={
                                                            0.7
                                                        }
                                                        includeFontPadding={
                                                            false
                                                        }
                                                    >
                                                        {COSTO_VIDA_CRISTALES} cristales
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    </Pressable>
                                </View>

                                {renderSeparator(
                                    POPOVER_AREAS.separador3
                                )}

                                <View
                                    style={[
                                        styles.crystalsArea,
                                        getGridStyle(
                                            POPOVER_AREAS.cristales
                                        ),
                                    ]}
                                >
                                    <Image
                                        source={require("../../assets/images/cristales_reward.png")}
                                        resizeMode="contain"
                                        style={styles.crystalIcon}
                                    />

                                    <Text
                                        style={[
                                            globalStyles.textBold,
                                            styles.crystalsText,
                                        ]}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        minimumFontScale={0.65}
                                        includeFontPadding={false}
                                    >
                                        Cristales: {cristales}
                                    </Text>
                                </View>
                            </>
                        )}

                        <DebugGrid
                            visible={
                                SHOW_POPOVER_GRID &&
                                contentLayout.width > 0 &&
                                contentLayout.height > 0
                            }
                            rows={GRID_FILAS}
                            columns={GRID_COLUMNAS}
                            cellWidth={
                                contentLayout.width / GRID_COLUMNAS
                            }
                            cellHeight={
                                contentLayout.height / GRID_FILAS
                            }
                            borderColor="rgba(30,80,180,0.62)"
                            zIndex={30}
                        />
                    </View>
                </View>

                {mensaje ? (
                    <Pressable
                        style={styles.noticeOverlay}
                        onPress={() => setMensaje("")}
                    >
                        <View style={styles.noticeBox}>
                            <Text
                                style={[
                                    globalStyles.navbarWorldText,
                                    styles.noticeText,
                                ]}
                                numberOfLines={2}
                                adjustsFontSizeToFit
                                minimumFontScale={0.7}
                                includeFontPadding={false}
                            >
                                {mensaje}
                            </Text>
                        </View>
                    </Pressable>
                ) : null}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
    },

    dismissLayer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(20, 13, 8, 0.34)",
    },

    popover: {
        position: "absolute",
        zIndex: 2,
        elevation: 220,
        overflow: "visible",
    },

    popoverBackground: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
        zIndex: 1,
    },

    popoverHitShield: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
        backgroundColor: "transparent",
    },

    /*
     * Insets basados en la zona útil de desplegable_Scroll.png.
     * La parte inferior termina antes de la punta.
     */
    contentGrid: {
        position: "absolute",
        left: "18%",
        right: "18%",
        top: "10%",
        bottom: "17%",
        zIndex: 3,
        overflow: "hidden",
    },

    areaCenter: {
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingHorizontal: 4,
    },

    title: {
        width: "100%",
        fontSize: 24,
        textAlign: "center",
        color: "#3D2615",
        textShadowColor: "rgba(0,0,0,0.25)",
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 2,
    },

    timeArea: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingHorizontal: "3%",
    },

    timeIcon: {
        width: "25%",
        height: "74%",
        aspectRatio: 1,
        marginRight: "5%",
    },

    timeTextBox: {
        width: "64%",
        height: "82%",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: "hidden",
    },

    timeLabel: {
        width: "100%",
        fontSize: 16,
        lineHeight: 19,
        color: "#3D2615",
    },

    timeValue: {
        width: "100%",
        fontSize: 15,
        lineHeight: 18,
        color: "#3D2615",
        marginTop: 2,
    },

    /*
     * El PNG del separador tiene mucho espacio transparente arriba y abajo.
     * "cover" lo amplía y esta ventana recorta solo la franja central visible.
     */
    separatorViewport: {
        width: "84%",
        height: 18,
        maxHeight: "72%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },

    separatorImage: {
        width: "100%",
        height: "100%",
    },

    buyButton: {
        width: "98%",
        height: "92%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },

    buyButtonImage: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },

    buyButtonTextLayer: {
        width: "78%",
        height: "64%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },

    buyButtonTitle: {
        width: "100%",
        color: "#F7E8C6",
        fontSize: 16,
        lineHeight: 19,
        textAlign: "center",
        textShadowColor: "rgba(0,0,0,0.6)",
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 2,
    },

    buyButtonCost: {
        width: "100%",
        color: "#F7E8C6",
        fontSize: 13,
        lineHeight: 16,
        textAlign: "center",
        marginTop: 1,
        textShadowColor: "rgba(0,0,0,0.6)",
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 2,
    },

    buyButtonPressed: {
        opacity: 0.84,
        transform: [{ scale: 0.98 }],
    },

    crystalsArea: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingHorizontal: "4%",
    },

    crystalIcon: {
        width: "27%",
        height: "78%",
        aspectRatio: 1,
        marginRight: "4%",
    },

    crystalsText: {
        width: "63%",
        fontSize: 16,
        lineHeight: 19,
        color: "#3D2615",
        textAlign: "left",
    },

    fullTitle: {
        width: "100%",
        fontSize: 20,
        lineHeight: 25,
        textAlign: "center",
        color: "#3D2615",
    },

    centerText: {
        width: "100%",
        fontSize: 16,
        lineHeight: 21,
        textAlign: "center",
        color: "#3D2615",
    },

    noticeOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 20,
        elevation: 240,
        backgroundColor: "rgba(20, 13, 8, 0.30)",
        alignItems: "center",
        justifyContent: "center",
    },

    noticeBox: {
        width: "82%",
        maxWidth: 350,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 14,
        backgroundColor: "rgba(244, 224, 180, 0.96)",
        borderWidth: 1.5,
        borderColor: "rgba(43, 26, 11, 0.78)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.32,
        shadowRadius: 6,
        elevation: 245,
    },

    noticeText: {
        width: "100%",
        color: "#6F1717",
        fontSize: 16,
        textAlign: "center",
    },

});
