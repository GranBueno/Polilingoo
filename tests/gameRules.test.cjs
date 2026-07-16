const test = require("node:test");
const assert = require("node:assert/strict");

const {
    MAX_VIDAS,
    INTERVALO_REGENERACION_ENERGIA_MS,
    calcularCristalesGanados,
    calcularPrecision,
    calcularRegeneracionEnergia,
    calcularSegundosParaTodasLasVidas,
} = require("../src/config/gameRules");

test("calcula recompensas y precisión", () => {
    assert.equal(calcularCristalesGanados(3, 4), 52);
    assert.equal(calcularPrecision(4, 5), 80);
    assert.equal(calcularPrecision(0, 0), 0);
});

test("regenera varios intervalos sin perder el sobrante", () => {
    const ahora = 10 * INTERVALO_REGENERACION_ENERGIA_MS;
    const resultado = calcularRegeneracionEnergia({
        energia: 1,
        marcaTiempo: ahora - 2.5 * INTERVALO_REGENERACION_ENERGIA_MS,
        ahora,
    });

    assert.equal(resultado.energia, 3);
    assert.equal(resultado.segundosParaSiguienteVida, 15 * 60);
});

test("limpia la marca de tiempo cuando las vidas quedan completas", () => {
    const resultado = calcularRegeneracionEnergia({
        energia: MAX_VIDAS - 1,
        marcaTiempo: 0,
        ahora: INTERVALO_REGENERACION_ENERGIA_MS,
    });

    assert.equal(resultado.energia, MAX_VIDAS);
    assert.equal(resultado.marcaTiempo, null);
    assert.equal(resultado.segundosParaSiguienteVida, 0);
});

test("calcula el tiempo total para recuperar todas las vidas", () => {
    assert.equal(calcularSegundosParaTodasLasVidas(2, 600), 2400);
    assert.equal(calcularSegundosParaTodasLasVidas(MAX_VIDAS, 600), 0);
});

test("un cambio de reloj hacia atrás no alarga el próximo intervalo", () => {
    const ahora = INTERVALO_REGENERACION_ENERGIA_MS;
    const resultado = calcularRegeneracionEnergia({
        energia: 2,
        marcaTiempo: ahora + INTERVALO_REGENERACION_ENERGIA_MS,
        ahora,
    });

    assert.equal(resultado.energia, 2);
    assert.equal(resultado.segundosParaSiguienteVida, 30 * 60);
    assert.equal(resultado.requierePersistencia, true);
});
