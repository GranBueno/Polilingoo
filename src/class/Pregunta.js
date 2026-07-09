export default class Pregunta {
    constructor(
        id,
        texto,
        instruccion = "Elige la traducción correcta.",
        pista = "",
        respuestas = [],
        respuestaCorrecta = null,
        orden = 1
    ) {
        this.id = id;
        this.texto = texto;
        this.instruccion = instruccion;
        this.pista = pista;
        this.respuestas = respuestas;
        this.respuestaCorrecta = respuestaCorrecta;
        this.orden = orden;
    }

    agregarRespuesta(respuesta) {
        this.respuestas.push(respuesta);

        if (respuesta.esCorrecta()) {
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

    toPlainObject() {
        return {
            id: this.id,
            texto: this.texto,
            instruccion: this.instruccion,
            pista: this.pista,
            orden: this.orden,
            respuestas: this.respuestas.map((respuesta) => respuesta.toPlainObject()),
            respuestaCorrectaId: this.respuestaCorrecta?.id ?? null,
        };
    }
}
