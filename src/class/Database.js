import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";

import Leccion from "./Leccion";
import Pregunta from "./Pregunta";
import Respuesta from "./Respuesta";

const DB_NAME = "Polilingo.db";

let db = null;

const nowISO = () => new Date().toISOString();

const SEED_MUNDOS = [
    {
        id: 1,
        nombre: "MUNDO VERDE",
        orden: 1,
    },
];

const SEED_DIFICULTADES = [
    {
        id: 1,
        nombre: "Inicial",
    },
];

const SEED_LECCIONES = [
    {
        id: 1,
        mundoId: 1,
        dificultadId: 1,
        nombre: "Lección 1",
        descripcion: "Naturaleza básica",
        orden: 1,
        preguntas: [
            {
                texto: "Forest",
                instruccion: "Elige la traducción correcta.",
                pista: "Un lugar con muchos árboles.",
                respuestas: [
                    { texto: "Bosque", correcta: true },
                    { texto: "Río", correcta: false },
                    { texto: "Montaña", correcta: false },
                    { texto: "Fuego", correcta: false },
                ],
            },
            {
                texto: "River",
                instruccion: "Elige la traducción correcta.",
                pista: "Agua que fluye por la tierra.",
                respuestas: [
                    { texto: "Piedra", correcta: false },
                    { texto: "Río", correcta: true },
                    { texto: "Árbol", correcta: false },
                    { texto: "Casa", correcta: false },
                ],
            },
            {
                texto: "Fire",
                instruccion: "Elige la traducción correcta.",
                pista: "Da calor y luz.",
                respuestas: [
                    { texto: "Agua", correcta: false },
                    { texto: "Fuego", correcta: true },
                    { texto: "Montaña", correcta: false },
                    { texto: "Viento", correcta: false },
                ],
            },
            {
                texto: "Mountain",
                instruccion: "Elige la traducción correcta.",
                pista: "Elevación grande de tierra.",
                respuestas: [
                    { texto: "Bosque", correcta: false },
                    { texto: "Cielo", correcta: false },
                    { texto: "Montaña", correcta: true },
                    { texto: "Luna", correcta: false },
                ],
            },
            {
                texto: "Water",
                instruccion: "Elige la traducción correcta.",
                pista: "La bebemos para vivir.",
                respuestas: [
                    { texto: "Agua", correcta: true },
                    { texto: "Fuego", correcta: false },
                    { texto: "Tierra", correcta: false },
                    { texto: "Sol", correcta: false },
                ],
            },
        ],
    },
    {
        id: 2,
        mundoId: 1,
        dificultadId: 1,
        nombre: "Lección 2",
        descripcion: "Cielo y tiempo",
        orden: 2,
        preguntas: [
            {
                texto: "Sun",
                instruccion: "Elige la traducción correcta.",
                pista: "Aparece durante el día.",
                respuestas: [
                    { texto: "Sol", correcta: true },
                    { texto: "Luna", correcta: false },
                    { texto: "Noche", correcta: false },
                    { texto: "Estrella", correcta: false },
                ],
            },
            {
                texto: "Moon",
                instruccion: "Elige la traducción correcta.",
                pista: "Se ve mucho durante la noche.",
                respuestas: [
                    { texto: "Día", correcta: false },
                    { texto: "Luna", correcta: true },
                    { texto: "Luz", correcta: false },
                    { texto: "Cielo", correcta: false },
                ],
            },
            {
                texto: "Star",
                instruccion: "Elige la traducción correcta.",
                pista: "Punto brillante en el cielo nocturno.",
                respuestas: [
                    { texto: "Roca", correcta: false },
                    { texto: "Estrella", correcta: true },
                    { texto: "Árbol", correcta: false },
                    { texto: "Agua", correcta: false },
                ],
            },
            {
                texto: "Day",
                instruccion: "Elige la traducción correcta.",
                pista: "Cuando hay luz del sol.",
                respuestas: [
                    { texto: "Día", correcta: true },
                    { texto: "Noche", correcta: false },
                    { texto: "Fuego", correcta: false },
                    { texto: "Río", correcta: false },
                ],
            },
            {
                texto: "Night",
                instruccion: "Elige la traducción correcta.",
                pista: "Cuando el cielo está oscuro.",
                respuestas: [
                    { texto: "Camino", correcta: false },
                    { texto: "Sol", correcta: false },
                    { texto: "Noche", correcta: true },
                    { texto: "Casa", correcta: false },
                ],
            },
        ],
    },
    {
        id: 3,
        mundoId: 1,
        dificultadId: 1,
        nombre: "Lección 3",
        descripcion: "Personas y criaturas",
        orden: 3,
        preguntas: [
            {
                texto: "Wolf",
                instruccion: "Elige la traducción correcta.",
                pista: "Animal parecido a un perro salvaje.",
                respuestas: [
                    { texto: "Lobo", correcta: true },
                    { texto: "Ave", correcta: false },
                    { texto: "Niño", correcta: false },
                    { texto: "Maestro", correcta: false },
                ],
            },
            {
                texto: "Bird",
                instruccion: "Elige la traducción correcta.",
                pista: "Animal con alas.",
                respuestas: [
                    { texto: "Luna", correcta: false },
                    { texto: "Ave", correcta: true },
                    { texto: "Fuego", correcta: false },
                    { texto: "Río", correcta: false },
                ],
            },
            {
                texto: "Friend",
                instruccion: "Elige la traducción correcta.",
                pista: "Persona cercana y de confianza.",
                respuestas: [
                    { texto: "Enemigo", correcta: false },
                    { texto: "Amigo", correcta: true },
                    { texto: "Bosque", correcta: false },
                    { texto: "Puerta", correcta: false },
                ],
            },
            {
                texto: "Teacher",
                instruccion: "Elige la traducción correcta.",
                pista: "Persona que enseña.",
                respuestas: [
                    { texto: "Maestro", correcta: true },
                    { texto: "Estrella", correcta: false },
                    { texto: "Camino", correcta: false },
                    { texto: "Viento", correcta: false },
                ],
            },
            {
                texto: "Child",
                instruccion: "Elige la traducción correcta.",
                pista: "Persona de poca edad.",
                respuestas: [
                    { texto: "Niño", correcta: true },
                    { texto: "Montaña", correcta: false },
                    { texto: "Agua", correcta: false },
                    { texto: "Libro", correcta: false },
                ],
            },
        ],
    },
    {
        id: 4,
        mundoId: 1,
        dificultadId: 1,
        nombre: "Lección 4",
        descripcion: "Acciones básicas",
        orden: 4,
        preguntas: [
            {
                texto: "Run",
                instruccion: "Elige la traducción correcta.",
                pista: "Moverse rápido con las piernas.",
                respuestas: [
                    { texto: "Correr", correcta: true },
                    { texto: "Dormir", correcta: false },
                    { texto: "Leer", correcta: false },
                    { texto: "Beber", correcta: false },
                ],
            },
            {
                texto: "Eat",
                instruccion: "Elige la traducción correcta.",
                pista: "Consumir comida.",
                respuestas: [
                    { texto: "Escribir", correcta: false },
                    { texto: "Comer", correcta: true },
                    { texto: "Correr", correcta: false },
                    { texto: "Mirar", correcta: false },
                ],
            },
            {
                texto: "Drink",
                instruccion: "Elige la traducción correcta.",
                pista: "Consumir líquido.",
                respuestas: [
                    { texto: "Beber", correcta: true },
                    { texto: "Leer", correcta: false },
                    { texto: "Saltar", correcta: false },
                    { texto: "Caminar", correcta: false },
                ],
            },
            {
                texto: "Read",
                instruccion: "Elige la traducción correcta.",
                pista: "Interpretar texto escrito.",
                respuestas: [
                    { texto: "Cantar", correcta: false },
                    { texto: "Leer", correcta: true },
                    { texto: "Beber", correcta: false },
                    { texto: "Abrir", correcta: false },
                ],
            },
            {
                texto: "Write",
                instruccion: "Elige la traducción correcta.",
                pista: "Crear palabras con letras.",
                respuestas: [
                    { texto: "Escribir", correcta: true },
                    { texto: "Correr", correcta: false },
                    { texto: "Comer", correcta: false },
                    { texto: "Dormir", correcta: false },
                ],
            },
        ],
    },
    {
        id: 5,
        mundoId: 1,
        dificultadId: 1,
        nombre: "Lección 5",
        descripcion: "Frases sencillas",
        orden: 5,
        preguntas: [
            {
                texto: "Good morning",
                instruccion: "Elige la traducción correcta.",
                pista: "Saludo usado al empezar el día.",
                respuestas: [
                    { texto: "Buenos días", correcta: true },
                    { texto: "Buenas noches", correcta: false },
                    { texto: "Gracias", correcta: false },
                    { texto: "Adiós", correcta: false },
                ],
            },
            {
                texto: "Thank you",
                instruccion: "Elige la traducción correcta.",
                pista: "Se usa para agradecer.",
                respuestas: [
                    { texto: "Hola", correcta: false },
                    { texto: "Gracias", correcta: true },
                    { texto: "Perdón", correcta: false },
                    { texto: "Hasta luego", correcta: false },
                ],
            },
            {
                texto: "See you later",
                instruccion: "Elige la traducción correcta.",
                pista: "Despedida temporal.",
                respuestas: [
                    { texto: "Hasta luego", correcta: true },
                    { texto: "Buenos días", correcta: false },
                    { texto: "Por favor", correcta: false },
                    { texto: "Bienvenido", correcta: false },
                ],
            },
            {
                texto: "Please",
                instruccion: "Elige la traducción correcta.",
                pista: "Hace una petición más amable.",
                respuestas: [
                    { texto: "Gracias", correcta: false },
                    { texto: "Por favor", correcta: true },
                    { texto: "Agua", correcta: false },
                    { texto: "Perdón", correcta: false },
                ],
            },
            {
                texto: "Welcome",
                instruccion: "Elige la traducción correcta.",
                pista: "Se dice al recibir a alguien.",
                respuestas: [
                    { texto: "Bienvenido", correcta: true },
                    { texto: "Adiós", correcta: false },
                    { texto: "Maestro", correcta: false },
                    { texto: "Noche", correcta: false },
                ],
            },
        ],
    },
];

class Database {
    static async inicializar() {
        if (db) {
            return db;
        }

        db = await SQLite.openDatabaseAsync(DB_NAME);

        await db.execAsync(`
            PRAGMA foreign_keys = ON;
            PRAGMA journal_mode = WAL;
        `);

        await this.crearTablas();
        await this.sembrarDatosIniciales();

        console.log("Base de datos inicializada correctamente.");

        return db;
    }

    static obtenerConexion() {
        if (!db) {
            throw new Error("La base de datos no ha sido inicializada.");
        }

        return db;
    }

    static async crearTablas() {
        const conexion = this.obtenerConexion();

        await conexion.execAsync(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL UNIQUE,
                correo TEXT NOT NULL UNIQUE,
                contrasena_hash TEXT NOT NULL,
                contrasena_salt TEXT NOT NULL,
                fecha_registro TEXT NOT NULL,
                ultima_sesion TEXT,
                puntaje INTEGER NOT NULL DEFAULT 0,
                mayor_racha INTEGER NOT NULL DEFAULT 0,
                racha_actual INTEGER NOT NULL DEFAULT 0,
                energia INTEGER NOT NULL DEFAULT 4
            );

            CREATE TABLE IF NOT EXISTS mundos (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                orden INTEGER NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS dificultades (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS lecciones (
                id INTEGER PRIMARY KEY,
                mundo_id INTEGER NOT NULL,
                dificultad_id INTEGER NOT NULL,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                orden INTEGER NOT NULL,
                FOREIGN KEY (mundo_id) REFERENCES mundos(id) ON DELETE CASCADE,
                FOREIGN KEY (dificultad_id) REFERENCES dificultades(id),
                UNIQUE (mundo_id, orden)
            );

            CREATE TABLE IF NOT EXISTS preguntas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                leccion_id INTEGER NOT NULL,
                texto TEXT NOT NULL,
                instruccion TEXT NOT NULL,
                pista TEXT,
                orden INTEGER NOT NULL,
                FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE CASCADE,
                UNIQUE (leccion_id, orden)
            );

            CREATE TABLE IF NOT EXISTS respuestas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pregunta_id INTEGER NOT NULL,
                texto TEXT NOT NULL,
                es_correcta INTEGER NOT NULL DEFAULT 0 CHECK (es_correcta IN (0, 1)),
                orden INTEGER NOT NULL,
                FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE,
                UNIQUE (pregunta_id, orden)
            );

            CREATE TABLE IF NOT EXISTS progreso_leccion (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                leccion_id INTEGER NOT NULL,
                desbloqueada INTEGER NOT NULL DEFAULT 0 CHECK (desbloqueada IN (0, 1)),
                completada INTEGER NOT NULL DEFAULT 0 CHECK (completada IN (0, 1)),
                mejor_precision INTEGER NOT NULL DEFAULT 0,
                mejor_tiempo_segundos INTEGER,
                intentos INTEGER NOT NULL DEFAULT 0,
                fecha_desbloqueo TEXT,
                fecha_completado TEXT,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE CASCADE,
                UNIQUE (usuario_id, leccion_id)
            );

            CREATE TABLE IF NOT EXISTS resultados_leccion (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                leccion_id INTEGER NOT NULL,
                correctas INTEGER NOT NULL,
                errores INTEGER NOT NULL,
                total_preguntas INTEGER NOT NULL,
                precision INTEGER NOT NULL,
                tiempo_total_segundos INTEGER NOT NULL,
                fecha_resultado TEXT NOT NULL,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE CASCADE
            );
        `);
    }

    static async sembrarDatosIniciales() {
        const conexion = this.obtenerConexion();
        const totalLecciones = await conexion.getFirstAsync(
            "SELECT COUNT(*) AS total FROM lecciones"
        );

        if ((totalLecciones?.total ?? 0) > 0) {
            return;
        }

        await conexion.withTransactionAsync(async () => {
            for (const mundo of SEED_MUNDOS) {
                await conexion.runAsync(
                    `
                    INSERT INTO mundos (id, nombre, orden)
                    VALUES (?, ?, ?)
                    `,
                    [mundo.id, mundo.nombre, mundo.orden]
                );
            }

            for (const dificultad of SEED_DIFICULTADES) {
                await conexion.runAsync(
                    `
                    INSERT INTO dificultades (id, nombre)
                    VALUES (?, ?)
                    `,
                    [dificultad.id, dificultad.nombre]
                );
            }

            for (const leccion of SEED_LECCIONES) {
                await conexion.runAsync(
                    `
                    INSERT INTO lecciones (
                        id,
                        mundo_id,
                        dificultad_id,
                        nombre,
                        descripcion,
                        orden
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    [
                        leccion.id,
                        leccion.mundoId,
                        leccion.dificultadId,
                        leccion.nombre,
                        leccion.descripcion,
                        leccion.orden,
                    ]
                );

                for (let preguntaIndex = 0; preguntaIndex < leccion.preguntas.length; preguntaIndex++) {
                    const pregunta = leccion.preguntas[preguntaIndex];
                    const preguntaResult = await conexion.runAsync(
                        `
                        INSERT INTO preguntas (
                            leccion_id,
                            texto,
                            instruccion,
                            pista,
                            orden
                        )
                        VALUES (?, ?, ?, ?, ?)
                        `,
                        [
                            leccion.id,
                            pregunta.texto,
                            pregunta.instruccion,
                            pregunta.pista,
                            preguntaIndex + 1,
                        ]
                    );

                    const preguntaId = preguntaResult.lastInsertRowId;

                    for (let respuestaIndex = 0; respuestaIndex < pregunta.respuestas.length; respuestaIndex++) {
                        const respuesta = pregunta.respuestas[respuestaIndex];

                        await conexion.runAsync(
                            `
                            INSERT INTO respuestas (
                                pregunta_id,
                                texto,
                                es_correcta,
                                orden
                            )
                            VALUES (?, ?, ?, ?)
                            `,
                            [
                                preguntaId,
                                respuesta.texto,
                                respuesta.correcta ? 1 : 0,
                                respuestaIndex + 1,
                            ]
                        );
                    }
                }
            }
        });
    }

    static async crearHashContrasena(contrasena, salt = Crypto.randomUUID()) {
        const hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            `${salt}:${contrasena}`
        );

        return {
            salt,
            hash,
        };
    }

    static async registrarUsuario(usuario) {
        const conexion = this.obtenerConexion();
        const fechaActual = nowISO();

        const usuarioExistente = await conexion.getFirstAsync(
            `
            SELECT id, nombre, correo
            FROM usuarios
            WHERE LOWER(nombre) = LOWER(?)
               OR LOWER(correo) = LOWER(?)
            LIMIT 1
            `,
            [usuario.nombre, usuario.correo]
        );

        if (usuarioExistente) {
            if (usuarioExistente.nombre.toLowerCase() === usuario.nombre.toLowerCase()) {
                throw new Error("Ese nombre de usuario ya está registrado.");
            }

            throw new Error("Ese correo electrónico ya está registrado.");
        }

        const contrasenaProcesada = await this.crearHashContrasena(usuario.contrasena);

        const resultado = await conexion.runAsync(
            `
            INSERT INTO usuarios (
                nombre,
                correo,
                contrasena_hash,
                contrasena_salt,
                fecha_registro,
                ultima_sesion,
                puntaje,
                mayor_racha,
                racha_actual,
                energia
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                usuario.nombre,
                usuario.correo,
                contrasenaProcesada.hash,
                contrasenaProcesada.salt,
                fechaActual,
                fechaActual,
                usuario.puntaje ?? 0,
                usuario.mayorRacha ?? 0,
                usuario.rachaActual ?? 0,
                usuario.energia ?? 4,
            ]
        );

        const usuarioId = resultado.lastInsertRowId;
        await this.inicializarProgresoUsuario(usuarioId);

        return this.obtenerUsuarioPorId(usuarioId);
    }

    static async obtenerUsuarioPorId(usuarioId) {
        const conexion = this.obtenerConexion();

        return conexion.getFirstAsync(
            `
            SELECT *
            FROM usuarios
            WHERE id = ?
            `,
            [usuarioId]
        );
    }

    static async inicializarProgresoUsuario(usuarioId) {
        const conexion = this.obtenerConexion();
        const lecciones = await conexion.getAllAsync(
            `
            SELECT id, orden
            FROM lecciones
            ORDER BY mundo_id, orden
            `
        );

        const fechaActual = nowISO();

        for (const leccion of lecciones) {
            const desbloqueada = leccion.orden === 1 ? 1 : 0;

            await conexion.runAsync(
                `
                INSERT OR IGNORE INTO progreso_leccion (
                    usuario_id,
                    leccion_id,
                    desbloqueada,
                    completada,
                    mejor_precision,
                    mejor_tiempo_segundos,
                    intentos,
                    fecha_desbloqueo,
                    fecha_completado
                )
                VALUES (?, ?, ?, 0, 0, NULL, 0, ?, NULL)
                `,
                [
                    usuarioId,
                    leccion.id,
                    desbloqueada,
                    desbloqueada ? fechaActual : null,
                ]
            );
        }
    }

    static async obtenerMundo(mundoId = 1) {
        const conexion = this.obtenerConexion();

        return conexion.getFirstAsync(
            `
            SELECT *
            FROM mundos
            WHERE id = ?
            `,
            [mundoId]
        );
    }

    static async obtenerLeccionesPorMundo(usuarioId, mundoId = 1) {
        const conexion = this.obtenerConexion();

        if (usuarioId) {
            await this.inicializarProgresoUsuario(usuarioId);
        }

        return conexion.getAllAsync(
            `
            SELECT
                l.id,
                l.nombre,
                l.descripcion,
                l.orden,
                l.mundo_id AS mundoId,
                COALESCE(pl.desbloqueada, CASE WHEN l.orden = 1 THEN 1 ELSE 0 END) AS desbloqueada,
                COALESCE(pl.completada, 0) AS completada,
                COALESCE(pl.mejor_precision, 0) AS mejorPrecision,
                pl.mejor_tiempo_segundos AS mejorTiempoSegundos,
                COALESCE(pl.intentos, 0) AS intentos
            FROM lecciones l
            LEFT JOIN progreso_leccion pl
                ON pl.leccion_id = l.id
               AND pl.usuario_id = ?
            WHERE l.mundo_id = ?
            ORDER BY l.orden ASC
            `,
            [usuarioId ?? -1, mundoId]
        );
    }

    static async obtenerLeccion(idLeccion) {
        const conexion = this.obtenerConexion();

        const datosLeccion = await conexion.getFirstAsync(
            `
            SELECT
                l.id,
                l.nombre,
                l.descripcion,
                l.orden,
                l.mundo_id AS mundoId,
                l.dificultad_id AS dificultadId,
                d.nombre AS dificultad
            FROM lecciones l
            INNER JOIN dificultades d
                ON d.id = l.dificultad_id
            WHERE l.id = ?
            `,
            [idLeccion]
        );

        if (!datosLeccion) {
            return null;
        }

        const leccion = new Leccion(
            datosLeccion.id,
            datosLeccion.nombre,
            datosLeccion.descripcion,
            datosLeccion.dificultadId,
            datosLeccion.mundoId,
            datosLeccion.orden
        );

        const preguntas = await conexion.getAllAsync(
            `
            SELECT *
            FROM preguntas
            WHERE leccion_id = ?
            ORDER BY orden ASC
            LIMIT 10
            `,
            [idLeccion]
        );

        for (const datosPregunta of preguntas) {
            const pregunta = new Pregunta(
                datosPregunta.id,
                datosPregunta.texto,
                datosPregunta.instruccion,
                datosPregunta.pista ?? "",
                [],
                null,
                datosPregunta.orden
            );

            const respuestas = await conexion.getAllAsync(
                `
                SELECT *
                FROM respuestas
                WHERE pregunta_id = ?
                ORDER BY orden ASC
                `,
                [datosPregunta.id]
            );

            for (const datosRespuesta of respuestas) {
                const respuesta = new Respuesta(
                    datosRespuesta.id,
                    datosRespuesta.texto,
                    datosRespuesta.es_correcta === 1,
                    datosRespuesta.orden
                );

                pregunta.agregarRespuesta(respuesta);
            }

            leccion.agregarPregunta(pregunta);
        }

        return leccion;
    }

    static async obtenerLeccionParaPantalla(idLeccion) {
        const leccion = await this.obtenerLeccion(idLeccion);

        if (!leccion) {
            return null;
        }

        return leccion.toPlainObject();
    }

    static async finalizarLeccion({
        usuarioId,
        leccionId,
        correctas,
        errores,
        totalPreguntas,
        tiempoTotalSegundos,
    }) {
        const conexion = this.obtenerConexion();
        const fechaActual = nowISO();
        const precision = totalPreguntas > 0
            ? Math.round((correctas / totalPreguntas) * 100)
            : 0;

        let resultadoFinal = {
            precision,
            siguienteLeccion: null,
            siguienteLeccionDesbloqueada: false,
        };

        await conexion.withTransactionAsync(async () => {
            await conexion.runAsync(
                `
                INSERT INTO resultados_leccion (
                    usuario_id,
                    leccion_id,
                    correctas,
                    errores,
                    total_preguntas,
                    precision,
                    tiempo_total_segundos,
                    fecha_resultado
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    usuarioId,
                    leccionId,
                    correctas,
                    errores,
                    totalPreguntas,
                    precision,
                    tiempoTotalSegundos,
                    fechaActual,
                ]
            );

            await conexion.runAsync(
                `
                INSERT INTO progreso_leccion (
                    usuario_id,
                    leccion_id,
                    desbloqueada,
                    completada,
                    mejor_precision,
                    mejor_tiempo_segundos,
                    intentos,
                    fecha_desbloqueo,
                    fecha_completado
                )
                VALUES (?, ?, 1, 1, ?, ?, 1, ?, ?)
                ON CONFLICT(usuario_id, leccion_id)
                DO UPDATE SET
                    desbloqueada = 1,
                    completada = 1,
                    mejor_precision = MAX(mejor_precision, excluded.mejor_precision),
                    mejor_tiempo_segundos = CASE
                        WHEN mejor_tiempo_segundos IS NULL THEN excluded.mejor_tiempo_segundos
                        WHEN excluded.mejor_tiempo_segundos < mejor_tiempo_segundos THEN excluded.mejor_tiempo_segundos
                        ELSE mejor_tiempo_segundos
                    END,
                    intentos = intentos + 1,
                    fecha_desbloqueo = COALESCE(fecha_desbloqueo, excluded.fecha_desbloqueo),
                    fecha_completado = excluded.fecha_completado
                `,
                [
                    usuarioId,
                    leccionId,
                    precision,
                    tiempoTotalSegundos,
                    fechaActual,
                    fechaActual,
                ]
            );

            const leccionActual = await conexion.getFirstAsync(
                `
                SELECT mundo_id, orden
                FROM lecciones
                WHERE id = ?
                `,
                [leccionId]
            );

            if (!leccionActual) {
                return;
            }

            const siguienteLeccion = await conexion.getFirstAsync(
                `
                SELECT id, nombre, descripcion, orden, mundo_id AS mundoId
                FROM lecciones
                WHERE mundo_id = ?
                  AND orden = ?
                LIMIT 1
                `,
                [leccionActual.mundo_id, leccionActual.orden + 1]
            );

            if (!siguienteLeccion) {
                return;
            }

            const progresoSiguiente = await conexion.getFirstAsync(
                `
                SELECT desbloqueada
                FROM progreso_leccion
                WHERE usuario_id = ?
                  AND leccion_id = ?
                `,
                [usuarioId, siguienteLeccion.id]
            );

            const yaEstabaDesbloqueada = progresoSiguiente?.desbloqueada === 1;

            await conexion.runAsync(
                `
                INSERT INTO progreso_leccion (
                    usuario_id,
                    leccion_id,
                    desbloqueada,
                    completada,
                    mejor_precision,
                    mejor_tiempo_segundos,
                    intentos,
                    fecha_desbloqueo,
                    fecha_completado
                )
                VALUES (?, ?, 1, 0, 0, NULL, 0, ?, NULL)
                ON CONFLICT(usuario_id, leccion_id)
                DO UPDATE SET
                    desbloqueada = 1,
                    fecha_desbloqueo = COALESCE(fecha_desbloqueo, excluded.fecha_desbloqueo)
                `,
                [usuarioId, siguienteLeccion.id, fechaActual]
            );

            resultadoFinal = {
                precision,
                siguienteLeccion,
                siguienteLeccionDesbloqueada: !yaEstabaDesbloqueada,
            };
        });

        return resultadoFinal;
    }
}

export default Database;
