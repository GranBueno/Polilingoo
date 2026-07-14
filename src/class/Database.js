import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";

import Leccion from "./Leccion";
import Pregunta from "./Pregunta";
import Respuesta from "./Respuesta";

const DB_NAME = "Polilingo.db";

let db = null;

const nowISO = () => new Date().toISOString();

const MAX_ENERGIA = 4;
const INTERVALO_REGENERACION_ENERGIA_MS = 30 * 60 * 1000;
const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

const pad2 = (value) => String(value).padStart(2, "0");

const obtenerFechaLocal = (date = new Date()) => {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const fechaLocalAUTC = (fechaLocal) => {
    const [year, month, day] = String(fechaLocal ?? "")
        .split("-")
        .map(Number);

    if (!year || !month || !day) {
        return null;
    }

    return Date.UTC(year, month - 1, day);
};

const calcularDiferenciaDias = (fechaAnterior, fechaActual) => {
    const anteriorUTC = fechaLocalAUTC(fechaAnterior);
    const actualUTC = fechaLocalAUTC(fechaActual);

    if (anteriorUTC === null || actualUTC === null) {
        return null;
    }

    return Math.round((actualUTC - anteriorUTC) / MILISEGUNDOS_POR_DIA);
};

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
        await this.migrarEsquema();
        await this.sembrarDatosIniciales();
        await this.sembrarCatalogoRecursos();
        await this.inicializarRecursosUsuariosExistentes();

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
                fecha_ultima_actividad TEXT,
                energia INTEGER NOT NULL DEFAULT 4 CHECK (energia BETWEEN 0 AND 4),
                energia_actualizada_en TEXT
            );

            CREATE TABLE IF NOT EXISTS actividad_diaria (
                usuario_id INTEGER NOT NULL,
                fecha_local TEXT NOT NULL,
                fecha_registro TEXT NOT NULL,
                PRIMARY KEY (usuario_id, fecha_local),
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
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
                correctas INTEGER NOT NULL CHECK (correctas >= 0),
                errores INTEGER NOT NULL CHECK (errores >= 0),
                total_preguntas INTEGER NOT NULL CHECK (total_preguntas >= 0),
                preguntas_respondidas INTEGER NOT NULL DEFAULT 0 CHECK (preguntas_respondidas >= 0),
                precision INTEGER NOT NULL CHECK (precision BETWEEN 0 AND 100),
                tiempo_total_segundos INTEGER NOT NULL CHECK (tiempo_total_segundos >= 0),
                completada INTEGER NOT NULL DEFAULT 1 CHECK (completada IN (0, 1)),
                motivo_finalizacion TEXT NOT NULL DEFAULT 'completada',
                cristales_ganados INTEGER NOT NULL DEFAULT 0 CHECK (cristales_ganados >= 0),
                pergaminos_ganados INTEGER NOT NULL DEFAULT 0 CHECK (pergaminos_ganados >= 0),
                fecha_resultado TEXT NOT NULL,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS tipos_recurso (
                id TEXT PRIMARY KEY,
                nombre TEXT NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS recursos_usuario (
                usuario_id INTEGER NOT NULL,
                recurso_id TEXT NOT NULL,
                cantidad INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
                PRIMARY KEY (usuario_id, recurso_id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (recurso_id) REFERENCES tipos_recurso(id)
            );

            CREATE TABLE IF NOT EXISTS movimientos_recurso (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                recurso_id TEXT NOT NULL,
                cantidad INTEGER NOT NULL,
                motivo TEXT NOT NULL,
                leccion_id INTEGER,
                clave_unica TEXT UNIQUE,
                fecha_movimiento TEXT NOT NULL,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (recurso_id) REFERENCES tipos_recurso(id),
                FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE SET NULL
            );

            CREATE INDEX IF NOT EXISTS idx_movimientos_recurso_usuario_fecha
            ON movimientos_recurso (usuario_id, fecha_movimiento);
        `);
    }

    static async agregarColumnaSiFalta(tabla, columna, definicion) {
        const conexion = this.obtenerConexion();
        const columnas = await conexion.getAllAsync(`PRAGMA table_info(${tabla})`);
        const existe = columnas.some((item) => item.name === columna);

        if (!existe) {
            await conexion.execAsync(
                `ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`
            );
        }
    }

    static async migrarEsquema() {
        await this.agregarColumnaSiFalta(
            "usuarios",
            "fecha_ultima_actividad",
            "TEXT"
        );
        await this.agregarColumnaSiFalta(
            "usuarios",
            "energia_actualizada_en",
            "TEXT"
        );
        await this.agregarColumnaSiFalta(
            "resultados_leccion",
            "preguntas_respondidas",
            "INTEGER NOT NULL DEFAULT 0"
        );
        await this.agregarColumnaSiFalta(
            "resultados_leccion",
            "completada",
            "INTEGER NOT NULL DEFAULT 1 CHECK (completada IN (0, 1))"
        );
        await this.agregarColumnaSiFalta(
            "resultados_leccion",
            "motivo_finalizacion",
            "TEXT NOT NULL DEFAULT 'completada'"
        );
        await this.agregarColumnaSiFalta(
            "resultados_leccion",
            "cristales_ganados",
            "INTEGER NOT NULL DEFAULT 0"
        );
        await this.agregarColumnaSiFalta(
            "resultados_leccion",
            "pergaminos_ganados",
            "INTEGER NOT NULL DEFAULT 0"
        );

        const conexion = this.obtenerConexion();

        await conexion.runAsync(`
            UPDATE resultados_leccion
            SET preguntas_respondidas = correctas + errores
            WHERE preguntas_respondidas = 0
              AND correctas + errores > 0
        `);

        await conexion.execAsync(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_respuesta_correcta_unica
            ON respuestas (pregunta_id)
            WHERE es_correcta = 1;

            CREATE TRIGGER IF NOT EXISTS trg_validar_resultado_leccion
            BEFORE INSERT ON resultados_leccion
            WHEN NEW.preguntas_respondidas <> NEW.correctas + NEW.errores
              OR NEW.preguntas_respondidas > NEW.total_preguntas
            BEGIN
                SELECT RAISE(
                    ABORT,
                    'El resultado de la lección contiene cantidades inconsistentes.'
                );
            END;
        `);
    }

    static async sembrarCatalogoRecursos() {
        const conexion = this.obtenerConexion();

        await conexion.runAsync(
            "INSERT OR IGNORE INTO tipos_recurso (id, nombre) VALUES (?, ?)",
            ["cristal", "Cristales"]
        );
        await conexion.runAsync(
            "INSERT OR IGNORE INTO tipos_recurso (id, nombre) VALUES (?, ?)",
            ["pergamino", "Pergaminos"]
        );
    }

    static async inicializarRecursosUsuario(usuarioId) {
        const conexion = this.obtenerConexion();

        await conexion.runAsync(
            `
            INSERT OR IGNORE INTO recursos_usuario (
                usuario_id,
                recurso_id,
                cantidad
            )
            VALUES (?, 'cristal', 0)
            `,
            [usuarioId]
        );

        await conexion.runAsync(
            `
            INSERT OR IGNORE INTO recursos_usuario (
                usuario_id,
                recurso_id,
                cantidad
            )
            VALUES (?, 'pergamino', 0)
            `,
            [usuarioId]
        );
    }

    static async inicializarRecursosUsuariosExistentes() {
        const conexion = this.obtenerConexion();
        const usuarios = await conexion.getAllAsync("SELECT id FROM usuarios");

        for (const usuario of usuarios) {
            await this.inicializarRecursosUsuario(usuario.id);
        }
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
                fecha_ultima_actividad,
                energia,
                energia_actualizada_en
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                null,
                usuario.energia ?? MAX_ENERGIA,
                null,
            ]
        );

        const usuarioId = resultado.lastInsertRowId;
        await this.inicializarProgresoUsuario(usuarioId);
        await this.inicializarRecursosUsuario(usuarioId);
        await this.registrarActividadDiaria(usuarioId);

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

    static async registrarActividadDiaria(usuarioId) {
        const conexion = this.obtenerConexion();
        const fechaHoy = obtenerFechaLocal();
        const fechaActual = nowISO();
        let resultadoRacha = null;

        await conexion.withTransactionAsync(async () => {
            const usuario = await conexion.getFirstAsync(
                `
                SELECT racha_actual, mayor_racha, fecha_ultima_actividad
                FROM usuarios
                WHERE id = ?
                `,
                [usuarioId]
            );

            if (!usuario) {
                throw new Error("El usuario no existe.");
            }

            const actividadInsertada = await conexion.runAsync(
                `
                INSERT OR IGNORE INTO actividad_diaria (
                    usuario_id,
                    fecha_local,
                    fecha_registro
                )
                VALUES (?, ?, ?)
                `,
                [usuarioId, fechaHoy, fechaActual]
            );

            if (actividadInsertada.changes === 0) {
                await conexion.runAsync(
                    "UPDATE usuarios SET ultima_sesion = ? WHERE id = ?",
                    [fechaActual, usuarioId]
                );

                resultadoRacha = {
                    rachaActual: usuario.racha_actual,
                    mayorRacha: usuario.mayor_racha,
                    fechaUltimaActividad: usuario.fecha_ultima_actividad,
                };
                return;
            }

            const diferenciaDias = calcularDiferenciaDias(
                usuario.fecha_ultima_actividad,
                fechaHoy
            );
            const rachaActual = diferenciaDias === 1
                ? usuario.racha_actual + 1
                : 1;
            const mayorRacha = Math.max(usuario.mayor_racha, rachaActual);

            await conexion.runAsync(
                `
                UPDATE usuarios
                SET racha_actual = ?,
                    mayor_racha = ?,
                    fecha_ultima_actividad = ?,
                    ultima_sesion = ?
                WHERE id = ?
                `,
                [rachaActual, mayorRacha, fechaHoy, fechaActual, usuarioId]
            );

            resultadoRacha = {
                rachaActual,
                mayorRacha,
                fechaUltimaActividad: fechaHoy,
            };
        });

        return resultadoRacha;
    }

    static async regenerarEnergia(usuarioId) {
        const conexion = this.obtenerConexion();
        const usuario = await conexion.getFirstAsync(
            `
            SELECT energia, energia_actualizada_en
            FROM usuarios
            WHERE id = ?
            `,
            [usuarioId]
        );

        if (!usuario) {
            throw new Error("El usuario no existe.");
        }

        const energiaActual = Math.max(
            0,
            Math.min(Number(usuario.energia) || 0, MAX_ENERGIA)
        );

        if (energiaActual >= MAX_ENERGIA) {
            if (usuario.energia_actualizada_en) {
                await conexion.runAsync(
                    `
                    UPDATE usuarios
                    SET energia = ?, energia_actualizada_en = NULL
                    WHERE id = ?
                    `,
                    [MAX_ENERGIA, usuarioId]
                );
            }

            return {
                energia: MAX_ENERGIA,
                segundosParaSiguienteVida: 0,
            };
        }

        const ahora = Date.now();
        const marcaTiempo = Date.parse(usuario.energia_actualizada_en ?? "");

        if (!Number.isFinite(marcaTiempo)) {
            const fechaActual = nowISO();

            await conexion.runAsync(
                `
                UPDATE usuarios
                SET energia_actualizada_en = ?
                WHERE id = ?
                `,
                [fechaActual, usuarioId]
            );

            return {
                energia: energiaActual,
                segundosParaSiguienteVida: Math.ceil(
                    INTERVALO_REGENERACION_ENERGIA_MS / 1000
                ),
            };
        }

        const intervalosCompletos = Math.floor(
            Math.max(0, ahora - marcaTiempo) /
                INTERVALO_REGENERACION_ENERGIA_MS
        );

        let nuevaEnergia = energiaActual;
        let nuevaMarcaTiempo = marcaTiempo;

        if (intervalosCompletos > 0) {
            nuevaEnergia = Math.min(
                MAX_ENERGIA,
                energiaActual + intervalosCompletos
            );

            nuevaMarcaTiempo =
                marcaTiempo +
                intervalosCompletos * INTERVALO_REGENERACION_ENERGIA_MS;

            await conexion.runAsync(
                `
                UPDATE usuarios
                SET energia = ?, energia_actualizada_en = ?
                WHERE id = ?
                `,
                [
                    nuevaEnergia,
                    nuevaEnergia >= MAX_ENERGIA
                        ? null
                        : new Date(nuevaMarcaTiempo).toISOString(),
                    usuarioId,
                ]
            );
        }

        if (nuevaEnergia >= MAX_ENERGIA) {
            return {
                energia: MAX_ENERGIA,
                segundosParaSiguienteVida: 0,
            };
        }

        const siguienteVidaEn =
            nuevaMarcaTiempo + INTERVALO_REGENERACION_ENERGIA_MS;

        return {
            energia: nuevaEnergia,
            segundosParaSiguienteVida: Math.max(
                1,
                Math.ceil((siguienteVidaEn - ahora) / 1000)
            ),
        };
    }

    static async descontarVida(usuarioId) {
        await this.regenerarEnergia(usuarioId);

        const conexion = this.obtenerConexion();
        const usuario = await conexion.getFirstAsync(
            `
            SELECT energia, energia_actualizada_en
            FROM usuarios
            WHERE id = ?
            `,
            [usuarioId]
        );

        if (!usuario) {
            throw new Error("El usuario no existe.");
        }

        const energiaActual = Math.max(
            0,
            Math.min(Number(usuario.energia) || 0, MAX_ENERGIA)
        );

        if (energiaActual <= 0) {
            return {
                energia: 0,
                sinVidas: true,
            };
        }

        const nuevaEnergia = energiaActual - 1;
        const inicioRegeneracion = usuario.energia_actualizada_en ?? nowISO();

        await conexion.runAsync(
            `
            UPDATE usuarios
            SET energia = ?, energia_actualizada_en = ?
            WHERE id = ?
            `,
            [nuevaEnergia, inicioRegeneracion, usuarioId]
        );

        return {
            energia: nuevaEnergia,
            sinVidas: nuevaEnergia === 0,
        };
    }

    static async obtenerRecursosUsuario(usuarioId) {
        await this.inicializarRecursosUsuario(usuarioId);

        const conexion = this.obtenerConexion();
        const recursos = await conexion.getAllAsync(
            `
            SELECT recurso_id AS recursoId, cantidad
            FROM recursos_usuario
            WHERE usuario_id = ?
            `,
            [usuarioId]
        );

        const resultado = {
            cristales: 0,
            pergaminos: 0,
        };

        for (const recurso of recursos) {
            if (recurso.recursoId === "cristal") {
                resultado.cristales = recurso.cantidad;
            }

            if (recurso.recursoId === "pergamino") {
                resultado.pergaminos = recurso.cantidad;
            }
        }

        return resultado;
    }

    static async obtenerEstadoJugador(
        usuarioId,
        { registrarActividad = true } = {}
    ) {
        if (!usuarioId) {
            return {
                energia: MAX_ENERGIA,
                rachaActual: 0,
                mayorRacha: 0,
                cristales: 0,
                pergaminos: 0,
                segundosParaSiguienteVida: 0,
            };
        }

        if (registrarActividad) {
            await this.registrarActividadDiaria(usuarioId);
        }

        const energia = await this.regenerarEnergia(usuarioId);
        const recursos = await this.obtenerRecursosUsuario(usuarioId);
        const usuario = await this.obtenerUsuarioPorId(usuarioId);

        return {
            energia: energia.energia,
            segundosParaSiguienteVida: energia.segundosParaSiguienteVida,
            rachaActual: usuario?.racha_actual ?? 0,
            mayorRacha: usuario?.mayor_racha ?? 0,
            cristales: recursos.cristales,
            pergaminos: recursos.pergaminos,
        };
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
        preguntasRespondidas = correctas + errores,
        completada = true,
        motivoFinalizacion = completada ? "completada" : "sin_vidas",
    }) {
        const conexion = this.obtenerConexion();
        const fechaActual = nowISO();

        const cantidades = [
            correctas,
            errores,
            totalPreguntas,
            preguntasRespondidas,
            tiempoTotalSegundos,
        ];

        if (cantidades.some((cantidad) => !Number.isInteger(cantidad) || cantidad < 0)) {
            throw new Error("Las cantidades del resultado deben ser enteros positivos.");
        }

        if (
            preguntasRespondidas !== correctas + errores ||
            preguntasRespondidas > totalPreguntas
        ) {
            throw new Error("El resultado de la lección contiene datos inconsistentes.");
        }

        const precision = totalPreguntas > 0
            ? Math.round((correctas / totalPreguntas) * 100)
            : 0;

        let resultadoFinal = {
            precision,
            completada,
            motivoFinalizacion,
            cristalesGanados: 0,
            pergaminosGanados: 0,
            recursos: await this.obtenerRecursosUsuario(usuarioId),
            siguienteLeccion: null,
            siguienteLeccionDesbloqueada: false,
        };

        await conexion.withTransactionAsync(async () => {
            const leccionActual = await conexion.getFirstAsync(
                `
                SELECT id, mundo_id, orden
                FROM lecciones
                WHERE id = ?
                `,
                [leccionId]
            );

            if (!leccionActual) {
                throw new Error("La lección no existe.");
            }

            const progresoAnterior = await conexion.getFirstAsync(
                `
                SELECT completada
                FROM progreso_leccion
                WHERE usuario_id = ? AND leccion_id = ?
                `,
                [usuarioId, leccionId]
            );

            const primeraFinalizacion =
                completada && progresoAnterior?.completada !== 1;
            const cristalesGanados = completada
                ? (leccionActual.orden + 10) * correctas
                : 0;

            let pergaminosGanados = 0;

            if (primeraFinalizacion) {
                const clavePergamino =
                    `primera-finalizacion:${usuarioId}:${leccionId}`;
                const recompensaExistente = await conexion.getFirstAsync(
                    `
                    SELECT id
                    FROM movimientos_recurso
                    WHERE clave_unica = ?
                    LIMIT 1
                    `,
                    [clavePergamino]
                );

                pergaminosGanados = recompensaExistente ? 0 : 1;
            }

            await conexion.runAsync(
                `
                INSERT INTO resultados_leccion (
                    usuario_id,
                    leccion_id,
                    correctas,
                    errores,
                    total_preguntas,
                    preguntas_respondidas,
                    precision,
                    tiempo_total_segundos,
                    completada,
                    motivo_finalizacion,
                    cristales_ganados,
                    pergaminos_ganados,
                    fecha_resultado
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    usuarioId,
                    leccionId,
                    correctas,
                    errores,
                    totalPreguntas,
                    preguntasRespondidas,
                    precision,
                    tiempoTotalSegundos,
                    completada ? 1 : 0,
                    motivoFinalizacion,
                    cristalesGanados,
                    pergaminosGanados,
                    fechaActual,
                ]
            );

            if (completada) {
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
                        fecha_completado = COALESCE(fecha_completado, excluded.fecha_completado)
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
            } else {
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
                    VALUES (?, ?, 1, 0, 0, NULL, 1, ?, NULL)
                    ON CONFLICT(usuario_id, leccion_id)
                    DO UPDATE SET intentos = intentos + 1
                    `,
                    [usuarioId, leccionId, fechaActual]
                );
            }

            if (cristalesGanados > 0) {
                await conexion.runAsync(
                    `
                    UPDATE recursos_usuario
                    SET cantidad = cantidad + ?
                    WHERE usuario_id = ? AND recurso_id = 'cristal'
                    `,
                    [cristalesGanados, usuarioId]
                );

                await conexion.runAsync(
                    `
                    INSERT INTO movimientos_recurso (
                        usuario_id,
                        recurso_id,
                        cantidad,
                        motivo,
                        leccion_id,
                        clave_unica,
                        fecha_movimiento
                    )
                    VALUES (?, 'cristal', ?, 'leccion_completada', ?, NULL, ?)
                    `,
                    [usuarioId, cristalesGanados, leccionId, fechaActual]
                );
            }

            if (pergaminosGanados > 0) {
                const clavePergamino =
                    `primera-finalizacion:${usuarioId}:${leccionId}`;

                const movimientoPergamino = await conexion.runAsync(
                    `
                    INSERT OR IGNORE INTO movimientos_recurso (
                        usuario_id,
                        recurso_id,
                        cantidad,
                        motivo,
                        leccion_id,
                        clave_unica,
                        fecha_movimiento
                    )
                    VALUES (?, 'pergamino', 1, 'primera_finalizacion', ?, ?, ?)
                    `,
                    [usuarioId, leccionId, clavePergamino, fechaActual]
                );

                if (movimientoPergamino.changes > 0) {
                    await conexion.runAsync(
                        `
                        UPDATE recursos_usuario
                        SET cantidad = cantidad + 1
                        WHERE usuario_id = ? AND recurso_id = 'pergamino'
                        `,
                        [usuarioId]
                    );
                }
            }

            let siguienteLeccion = null;
            let siguienteLeccionDesbloqueada = false;

            if (completada) {
                siguienteLeccion = await conexion.getFirstAsync(
                    `
                    SELECT id, nombre, descripcion, orden, mundo_id AS mundoId
                    FROM lecciones
                    WHERE mundo_id = ? AND orden = ?
                    LIMIT 1
                    `,
                    [leccionActual.mundo_id, leccionActual.orden + 1]
                );

                if (siguienteLeccion) {
                    const progresoSiguiente = await conexion.getFirstAsync(
                        `
                        SELECT desbloqueada
                        FROM progreso_leccion
                        WHERE usuario_id = ? AND leccion_id = ?
                        `,
                        [usuarioId, siguienteLeccion.id]
                    );

                    const yaEstabaDesbloqueada =
                        progresoSiguiente?.desbloqueada === 1;

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

                    siguienteLeccionDesbloqueada = !yaEstabaDesbloqueada;
                }
            }

            const recursos = await conexion.getAllAsync(
                `
                SELECT recurso_id AS recursoId, cantidad
                FROM recursos_usuario
                WHERE usuario_id = ?
                `,
                [usuarioId]
            );

            const recursosActuales = {
                cristales: 0,
                pergaminos: 0,
            };

            for (const recurso of recursos) {
                if (recurso.recursoId === "cristal") {
                    recursosActuales.cristales = recurso.cantidad;
                }

                if (recurso.recursoId === "pergamino") {
                    recursosActuales.pergaminos = recurso.cantidad;
                }
            }

            resultadoFinal = {
                precision,
                completada,
                motivoFinalizacion,
                cristalesGanados,
                pergaminosGanados,
                recursos: recursosActuales,
                siguienteLeccion,
                siguienteLeccionDesbloqueada,
            };
        });

        return resultadoFinal;
    }
}

export default Database;
