export default class Leccion {
    static MAX_PREGUNTAS = 10;

    constructor(
        id,
        nombre,
        descripcion = "",
        idDificultad = 1,
        mundoId = 1,
        orden = 1
    ) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.idDificultad = idDificultad;
        this.mundoId = mundoId;
        this.orden = orden;

        // Map<idPregunta, Pregunta>
        this.preguntas = new Map();

        // Mantiene el orden de navegación
        this.ordenPreguntas = [];

        this.indiceActual = 0;
    }

    agregarPregunta(pregunta) {
        if (this.preguntas.size >= Leccion.MAX_PREGUNTAS) {
            throw new Error(
                `La lección solo puede contener ${Leccion.MAX_PREGUNTAS} preguntas`
            );
        }

        this.preguntas.set(pregunta.id, pregunta);
        this.ordenPreguntas.push(pregunta.id);
    }

    obtenerPregunta(idPregunta) {
        return this.preguntas.get(idPregunta);
    }

    obtenerPreguntaActual() {
        if (this.ordenPreguntas.length === 0) {
            return null;
        }

        const idPregunta = this.ordenPreguntas[this.indiceActual];
        return this.preguntas.get(idPregunta);
    }

    siguientePregunta() {
        if (this.indiceActual < this.ordenPreguntas.length - 1) {
            this.indiceActual++;
        }

        return this.obtenerPreguntaActual();
    }

    anteriorPregunta() {
        if (this.indiceActual > 0) {
            this.indiceActual--;
        }

        return this.obtenerPreguntaActual();
    }

    reiniciar() {
        this.indiceActual = 0;
    }

    finalizada() {
        return this.indiceActual >= this.ordenPreguntas.length - 1;
    }

    cantidadPreguntas() {
        return this.preguntas.size;
    }

    obtenerTodasLasPreguntas() {
        return this.ordenPreguntas.map((idPregunta) => this.preguntas.get(idPregunta));
    }

    contienePregunta(idPregunta) {
        return this.preguntas.has(idPregunta);
    }

    eliminarPregunta(idPregunta) {
        const indice = this.ordenPreguntas.indexOf(idPregunta);

        if (indice !== -1) {
            this.ordenPreguntas.splice(indice, 1);
        }

        return this.preguntas.delete(idPregunta);
    }

    toPlainObject() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            idDificultad: this.idDificultad,
            mundoId: this.mundoId,
            orden: this.orden,
            preguntas: this.obtenerTodasLasPreguntas().map((pregunta) => pregunta.toPlainObject()),
        };
    }
}
