const MAX_VIDAS = 4;
const COSTO_VIDA_CRISTALES = 20;
const INTERVALO_REGENERACION_ENERGIA_MS = 30 * 60 * 1000;
const SEGUNDOS_POR_VIDA = INTERVALO_REGENERACION_ENERGIA_MS / 1000;

const RETRASO_TINT_RESPUESTA_MS = 2000;
const RETRASO_SIGUIENTE_PREGUNTA_MS = 3000;
const DURACION_MENSAJE_MS = 3000;

const normalizarVidas = (energia) =>
    Math.max(0, Math.min(Number(energia) || 0, MAX_VIDAS));

const calcularPrecision = (correctas, totalPreguntas) => {
    const totalSeguro = Math.max(0, Number(totalPreguntas) || 0);
    const correctasSeguras = Math.max(0, Number(correctas) || 0);

    return totalSeguro > 0
        ? Math.round((correctasSeguras / totalSeguro) * 100)
        : 0;
};

const calcularCristalesGanados = (ordenLeccion, correctas) => {
    const ordenSeguro = Math.max(0, Number(ordenLeccion) || 0);
    const correctasSeguras = Math.max(0, Number(correctas) || 0);

    return (ordenSeguro + 10) * correctasSeguras;
};

const calcularSegundosParaTodasLasVidas = (
    energia,
    segundosParaSiguienteVida
) => {
    const vidas = normalizarVidas(energia);
    const vidasFaltantes = MAX_VIDAS - vidas;

    if (vidasFaltantes === 0) {
        return 0;
    }

    return (
        Math.max(0, Math.ceil(Number(segundosParaSiguienteVida) || 0)) +
        Math.max(0, vidasFaltantes - 1) * SEGUNDOS_POR_VIDA
    );
};

const calcularRegeneracionEnergia = ({
    energia,
    marcaTiempo,
    ahora = Date.now(),
}) => {
    const energiaActual = normalizarVidas(energia);

    if (energiaActual >= MAX_VIDAS) {
        return {
            energia: MAX_VIDAS,
            marcaTiempo: null,
            segundosParaSiguienteVida: 0,
            requierePersistencia: marcaTiempo !== null,
        };
    }

    const marcaTiempoMs =
        typeof marcaTiempo === "number"
            ? marcaTiempo
            : Date.parse(String(marcaTiempo ?? ""));

    if (!Number.isFinite(marcaTiempoMs)) {
        return {
            energia: energiaActual,
            marcaTiempo: ahora,
            segundosParaSiguienteVida: SEGUNDOS_POR_VIDA,
            requierePersistencia: true,
        };
    }

    const marcaTiempoSegura = Math.min(marcaTiempoMs, ahora);
    const intervalosCompletos = Math.floor(
        Math.max(0, ahora - marcaTiempoSegura) /
            INTERVALO_REGENERACION_ENERGIA_MS
    );
    const nuevaEnergia = Math.min(
        MAX_VIDAS,
        energiaActual + intervalosCompletos
    );
    const nuevaMarcaTiempo =
        marcaTiempoSegura +
        intervalosCompletos * INTERVALO_REGENERACION_ENERGIA_MS;

    if (nuevaEnergia >= MAX_VIDAS) {
        return {
            energia: MAX_VIDAS,
            marcaTiempo: null,
            segundosParaSiguienteVida: 0,
            requierePersistencia: true,
        };
    }

    return {
        energia: nuevaEnergia,
        marcaTiempo: nuevaMarcaTiempo,
        segundosParaSiguienteVida: Math.max(
            1,
            Math.ceil(
                (nuevaMarcaTiempo +
                    INTERVALO_REGENERACION_ENERGIA_MS -
                    ahora) /
                    1000
            )
        ),
        requierePersistencia:
            intervalosCompletos > 0 || marcaTiempoSegura !== marcaTiempoMs,
    };
};

module.exports = {
    MAX_VIDAS,
    COSTO_VIDA_CRISTALES,
    INTERVALO_REGENERACION_ENERGIA_MS,
    SEGUNDOS_POR_VIDA,
    RETRASO_TINT_RESPUESTA_MS,
    RETRASO_SIGUIENTE_PREGUNTA_MS,
    DURACION_MENSAJE_MS,
    normalizarVidas,
    calcularPrecision,
    calcularCristalesGanados,
    calcularSegundosParaTodasLasVidas,
    calcularRegeneracionEnergia,
};
