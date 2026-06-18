export default class Pregunta {
    constructor(
        id,
        texto,
        pista,
        respuestas = [],
        respuestaCorrecta = null
    ) {
        this.id = id;
        this.texto = texto;
        this.pista = pista;

        // Array con las 4 respuestas
        this.respuestas = respuestas;

        // Referencia directa a la respuesta correcta
        this.respuestaCorrecta = respuestaCorrecta;
    }

    agregarRespuesta(respuesta) {
        this.respuestas.push(respuesta);

        if (respuesta.validez) {
            this.respuestaCorrecta = respuesta;
        }
    }

    obtenerRespuestaCorrecta() {
        return this.respuestaCorrecta;
    }

    verificarRespuesta(idRespuesta) {
        if (!this.respuestaCorrecta) {
            return false;
        }

        return this.respuestaCorrecta.id === idRespuesta;
    }

    obtenerPista() {
        return this.pista;
    }

    obtenerRespuestas() {
        return this.respuestas;
    }
}