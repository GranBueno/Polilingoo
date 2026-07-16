import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Image,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

import { globalStyles } from "../../styles/styles";
import { MAX_VIDAS } from "../../config/gameRules";
import DebugGrid from "../layout/DebugGrid";
import LivesPopover from "./LivesPopover";

const NAVBAR_GRID = {
    filas: 5,
    columnas: 10,
};

const SHOW_NAVBAR_GRID = false;

/*
 * Este punto determina dónde debe tocar la punta del desplegable.
 * Se encuentra dentro del cuadrado del icono de vidas.
 *
 * Si posteriormente cambias el asset vidas.png, este es el único valor
 * que tendrías que ajustar ligeramente.
 */
const HEART_ANCHOR_Y_RATIO = 0.08;

const NAVBAR_AREAS = {
    racha: {
        fila: 1,
        columna: 1,
        filas: 5,
        columnas: 3,
    },
    vidas: {
        fila: 1,
        columna: 4,
        filas: 5,
        columnas: 4,
    },
    perfil: {
        fila: 1,
        columna: 8,
        filas: 5,
        columnas: 3,
    },
};

const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);

export default function WorldBottomNavbar({
    usuarioId = null,
    racha = 0,
    energia = MAX_VIDAS,
    cristales = 0,
    segundosParaSiguienteVida = 0,
    onPressProfile = () => {},
    onEstadoJugadorChange = () => {},
}) {
    const { width: screenWidth } = useWindowDimensions();

    /*
     * Se mide un punto de 1 × 1 ubicado sobre el corazón visible.
     * No se mide el PNG completo, porque puede contener márgenes transparentes.
     */
    const livesPopoverAnchorRef = useRef(null);

    const [desplegableVisible, setDesplegableVisible] =
        useState(false);
    const [livesAnchor, setLivesAnchor] = useState(null);
    const [estadoLocal, setEstadoLocal] = useState({
        energia,
        cristales,
        segundosParaSiguienteVida,
    });

    useEffect(() => {
        setEstadoLocal({
            energia,
            cristales,
            segundosParaSiguienteVida,
        });
    }, [energia, cristales, segundosParaSiguienteVida]);

    const navbarWidth = useMemo(() => {
        const maximumForScreen = Math.max(260, screenWidth - 20);

        return Math.min(
            clamp(screenWidth * 0.85, 270, 540),
            maximumForScreen
        );
    }, [screenWidth]);

    const navbarHeight = useMemo(
        () => clamp(navbarWidth / 3, 96, 180),
        [navbarWidth]
    );

    const cellWidth = navbarWidth / NAVBAR_GRID.columnas;
    const cellHeight = navbarHeight / NAVBAR_GRID.filas;

    const getNavbarCellStyle = useCallback(
        (area) => ({
            position: "absolute",
            width: cellWidth * area.columnas,
            height: cellHeight * area.filas,
            left: cellWidth * (area.columna - 1),
            top: cellHeight * (area.fila - 1),
        }),
        [cellHeight, cellWidth]
    );

    const energiaSegura = Math.max(
        0,
        Math.min(
            Number(estadoLocal.energia) || 0,
            MAX_VIDAS
        )
    );

    const actualizarEstado = useCallback(
        (nuevoEstado) => {
            setEstadoLocal((actual) => ({
                ...actual,
                ...nuevoEstado,
            }));

            onEstadoJugadorChange(nuevoEstado);
        },
        [onEstadoJugadorChange]
    );

    const medirPuntoDelCorazon = useCallback((callback) => {
        const node = livesPopoverAnchorRef.current;

        if (
            !node ||
            typeof node.measureInWindow !== "function"
        ) {
            callback?.(null);
            return;
        }

        node.measureInWindow((x, y, width, height) => {
            if (width > 0 && height > 0) {
                callback?.({
                    x,
                    y,
                    width,
                    height,
                });
                return;
            }

            callback?.(null);
        });
    }, []);

    const abrirDesplegableVidas = useCallback(() => {
        requestAnimationFrame(() => {
            medirPuntoDelCorazon((anchor) => {
                setLivesAnchor(anchor);
                setDesplegableVisible(true);
            });
        });
    }, [medirPuntoDelCorazon]);

    useEffect(() => {
        if (!desplegableVisible) {
            return;
        }

        requestAnimationFrame(() => {
            medirPuntoDelCorazon((anchor) => {
                if (anchor) {
                    setLivesAnchor(anchor);
                }
            });
        });
    }, [
        desplegableVisible,
        medirPuntoDelCorazon,
        navbarWidth,
    ]);

    const sideIconSize = clamp(
        navbarHeight * 0.5,
        46,
        76
    );
    const centerIconSize = clamp(
        navbarHeight * 0.66,
        58,
        100
    );
    const labelFontSize = clamp(
        navbarHeight * 0.105,
        10,
        15
    );

    return (
        <>
            <View
                pointerEvents="box-none"
                style={[
                    styles.container,
                    {
                        width: navbarWidth,
                        height: navbarHeight,
                    },
                ]}
            >
                <ImageBackground
                    source={require("../../assets/navbar/navbar_bottom.png")}
                    resizeMode="stretch"
                    style={styles.navbarBackground}
                >
                    <View style={styles.navbarGridContent}>
                        <View
                            style={[
                                styles.navItem,
                                getNavbarCellStyle(
                                    NAVBAR_AREAS.racha
                                ),
                            ]}
                        >
                            <Image
                                source={require("../../assets/navbar/racha.png")}
                                style={{
                                    width: sideIconSize,
                                    height: sideIconSize,
                                }}
                                resizeMode="contain"
                            />

                            <Text
                                style={[
                                    globalStyles.navbarSmallText,
                                    styles.descriptionText,
                                    {
                                        fontSize: labelFontSize,
                                        lineHeight:
                                            labelFontSize + 3,
                                    },
                                ]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.72}
                                includeFontPadding={false}
                            >
                                {racha}{" "}
                                {racha === 1
                                    ? "día"
                                    : "días"}
                            </Text>
                        </View>

                        <Pressable
                            onPress={abrirDesplegableVidas}
                            style={({ pressed }) => [
                                styles.navItem,
                                styles.centerItem,
                                getNavbarCellStyle(
                                    NAVBAR_AREAS.vidas
                                ),
                                pressed &&
                                    globalStyles.pressed,
                            ]}
                        >
                            <View
                                style={[
                                    styles.livesIconAnchor,
                                    {
                                        width: centerIconSize,
                                        height: centerIconSize,
                                    },
                                ]}
                            >
                                <Image
                                    source={require("../../assets/navbar/vidas.png")}
                                    style={styles.fillImage}
                                    resizeMode="contain"
                                />

                                <View
                                    ref={
                                        livesPopoverAnchorRef
                                    }
                                    collapsable={false}
                                    pointerEvents="none"
                                    style={[
                                        styles.livesPopoverAnchorPoint,
                                        {
                                            left:
                                                centerIconSize /
                                                2,
                                            top:
                                                centerIconSize *
                                                HEART_ANCHOR_Y_RATIO,
                                        },
                                    ]}
                                />
                            </View>

                            <Text
                                style={[
                                    globalStyles.navbarSmallText,
                                    styles.descriptionText,
                                    {
                                        fontSize: labelFontSize,
                                        lineHeight:
                                            labelFontSize + 3,
                                    },
                                ]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.68}
                                includeFontPadding={false}
                            >
                                {energiaSegura}/{MAX_VIDAS} vidas
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={onPressProfile}
                            style={({ pressed }) => [
                                styles.navItem,
                                getNavbarCellStyle(
                                    NAVBAR_AREAS.perfil
                                ),
                                pressed &&
                                    globalStyles.pressed,
                            ]}
                        >
                            <Image
                                source={require("../../assets/navbar/perfil.png")}
                                style={{
                                    width: sideIconSize,
                                    height: sideIconSize,
                                }}
                                resizeMode="contain"
                            />

                            <Text
                                style={[
                                    globalStyles.navbarSmallText,
                                    styles.descriptionText,
                                    {
                                        fontSize: labelFontSize,
                                        lineHeight:
                                            labelFontSize + 3,
                                    },
                                ]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.72}
                                includeFontPadding={false}
                            >
                                Perfil
                            </Text>
                        </Pressable>
                    </View>

                    <DebugGrid
                        visible={SHOW_NAVBAR_GRID}
                        rows={NAVBAR_GRID.filas}
                        columns={NAVBAR_GRID.columnas}
                        cellWidth={cellWidth}
                        cellHeight={cellHeight}
                        borderColor="rgba(180, 25, 25, 0.9)"
                        zIndex={100}
                    />
                </ImageBackground>
            </View>

            <LivesPopover
                visible={desplegableVisible}
                anchor={livesAnchor}
                usuarioId={usuarioId}
                estadoJugador={{
                    ...estadoLocal,
                    rachaActual: racha,
                }}
                onClose={() =>
                    setDesplegableVisible(false)
                }
                onEstadoChange={actualizarEstado}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        alignSelf: "center",
        bottom: 14,
        zIndex: 150,
        elevation: 150,
    },

    navbarBackground: {
        width: "100%",
        height: "100%",
    },

    navbarGridContent: {
        ...StyleSheet.absoluteFillObject,
        position: "absolute",
        overflow: "visible",
    },

    navItem: {
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
        paddingTop: "3%",
        paddingHorizontal: 4,
    },

    centerItem: {
        paddingTop: 0,
    },

    livesIconAnchor: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
    },

    livesPopoverAnchorPoint: {
        position: "absolute",
        width: 1,
        height: 1,
    },

    fillImage: {
        width: "100%",
        height: "100%",
    },

    descriptionText: {
        width: "100%",
        color: "#3D2615",
        textAlign: "center",
        textAlignVertical: "center",
        marginTop: -4,
        textShadowColor: "rgba(255,245,220,0.75)",
        textShadowOffset: {
            width: 1,
            height: 1,
        },
        textShadowRadius: 1,
    },

});
