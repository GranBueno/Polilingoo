import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import Database from "../class/Database";
import { MAX_VIDAS } from "../config/gameRules";

const DEFAULT_PLAYER_STATE = {
    energia: MAX_VIDAS,
    rachaActual: 0,
    mayorRacha: 0,
    cristales: 0,
    pergaminos: 0,
    segundosParaSiguienteVida: 0,
};

export default function usePlayerState(
    usuarioId,
    {
        enabled = true,
        initialState = {},
        registerActivityOnEnable = false,
    } = {}
) {
    const [estadoJugador, setEstadoJugadorInterno] = useState(() => ({
        ...DEFAULT_PLAYER_STATE,
        ...initialState,
    }));
    const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
    const [playerError, setPlayerError] = useState(null);

    const mountedRef = useRef(true);
    const latestRequestRef = useRef(0);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    const setEstadoJugador = useCallback((nextState) => {
        setEstadoJugadorInterno((currentState) => {
            const resolvedState =
                typeof nextState === "function"
                    ? nextState(currentState)
                    : nextState;

            return {
                ...currentState,
                ...resolvedState,
            };
        });
    }, []);

    const refreshEstadoJugador = useCallback(
        async ({ registrarActividad = false } = {}) => {
            if (!usuarioId) {
                return DEFAULT_PLAYER_STATE;
            }

            const requestId = latestRequestRef.current + 1;
            latestRequestRef.current = requestId;

            if (mountedRef.current) {
                setIsLoadingPlayer(true);
                setPlayerError(null);
            }

            try {
                const nextState = await Database.obtenerEstadoJugador(
                    usuarioId,
                    { registrarActividad }
                );

                if (
                    mountedRef.current &&
                    requestId === latestRequestRef.current
                ) {
                    setEstadoJugadorInterno((currentState) => ({
                        ...currentState,
                        ...nextState,
                    }));
                }

                return nextState;
            } catch (error) {
                if (
                    mountedRef.current &&
                    requestId === latestRequestRef.current
                ) {
                    setPlayerError(error);
                }

                throw error;
            } finally {
                if (
                    mountedRef.current &&
                    requestId === latestRequestRef.current
                ) {
                    setIsLoadingPlayer(false);
                }
            }
        },
        [usuarioId]
    );

    useEffect(() => {
        if (!enabled || !usuarioId) {
            return undefined;
        }

        refreshEstadoJugador({
            registrarActividad: registerActivityOnEnable,
        }).catch((error) => {
            console.error("No se pudo actualizar el estado del jugador:", error);
        });

        return undefined;
    }, [
        enabled,
        refreshEstadoJugador,
        registerActivityOnEnable,
        usuarioId,
    ]);

    useEffect(() => {
        if (!enabled || !usuarioId) {
            return undefined;
        }

        const subscription = AppState.addEventListener(
            "change",
            (nextState) => {
                if (nextState === "active") {
                    refreshEstadoJugador({
                        registrarActividad: registerActivityOnEnable,
                    }).catch((error) => {
                        console.error(
                            "No se pudo refrescar el estado del jugador:",
                            error
                        );
                    });
                }
            }
        );

        return () => subscription.remove();
    }, [
        enabled,
        refreshEstadoJugador,
        registerActivityOnEnable,
        usuarioId,
    ]);

    useEffect(() => {
        const segundos = Math.max(
            0,
            Number(estadoJugador.segundosParaSiguienteVida) || 0
        );

        if (
            !enabled ||
            !usuarioId ||
            estadoJugador.energia >= MAX_VIDAS ||
            segundos <= 0
        ) {
            return undefined;
        }

        const timeout = setTimeout(() => {
            refreshEstadoJugador({ registrarActividad: false }).catch(
                (error) => {
                    console.error(
                        "No se pudo regenerar el estado del jugador:",
                        error
                    );
                }
            );
        }, segundos * 1000 + 250);

        return () => clearTimeout(timeout);
    }, [
        enabled,
        estadoJugador.energia,
        estadoJugador.segundosParaSiguienteVida,
        refreshEstadoJugador,
        usuarioId,
    ]);

    return {
        estadoJugador,
        setEstadoJugador,
        refreshEstadoJugador,
        isLoadingPlayer,
        playerError,
    };
}
