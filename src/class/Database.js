import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";

import Leccion from "./Leccion";
import Pregunta from "./Pregunta";
import Respuesta from "./Respuesta";
import {
    SEED_DIFICULTADES,
    SEED_LECCIONES,
    SEED_MUNDOS,
} from "../data/worldsdata";
import {
    COSTO_VIDA_CRISTALES,
    MAX_VIDAS,
    calcularCristalesGanados,
    calcularPrecision,
    calcularRegeneracionEnergia,
} from "../config/gameRules";

const DB_NAME = "Polilingo.db";
const DB_SCHEMA_VERSION = 3;

let db = null;
let initializationPromise = null;
let writeQueue = Promise.resolve();

const nowISO = () => new Date().toISOString();

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

const ejecutarEscrituraSerializada = (task) => {
    const nextTask = writeQueue.then(task, task);
    writeQueue = nextTask.catch(() => undefined);
    return nextTask;
};

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

const mapearRecursos = (recursos = []) => {
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
};

class Database {
    static inicializar() {
        if (!initializationPromise) {
            initializationPromise = this.inicializarInterno().catch((error) => {
                db = null;
                initializationPromise = null;
                throw error;
            });
        }

        return initializationPromise;
    }

    static async inicializarInterno() {
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
        await this.inicializarProgresoUsuariosExistentes();

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
                energia INTEGER NOT NULL DEFAULT ${MAX_VIDAS}
                    CHECK (energia BETWEEN 0 AND ${MAX_VIDAS}),
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
                clave_intento TEXT,
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

            CREATE TABLE IF NOT EXISTS metadatos_app (
                clave TEXT PRIMARY KEY,
                valor TEXT NOT NULL
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
        const conexion = this.obtenerConexion();
        const versionResult = await conexion.getFirstAsync(
            "PRAGMA user_version"
        );
        const currentVersion = Number(versionResult?.user_version) || 0;

        if (currentVersion >= DB_SCHEMA_VERSION) {
            return;
        }

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
        await this.agregarColumnaSiFalta(
            "resultados_leccion",
            "clave_intento",
            "TEXT"
        );

        await conexion.runAsync(`
            UPDATE resultados_leccion
            SET preguntas_respondidas = correctas + errores
            WHERE preguntas_respondidas = 0
              AND correctas + errores > 0
        `);

        await conexion.runAsync(`
            UPDATE respuestas
            SET es_correcta = 0
            WHERE es_correcta = 1
              AND id NOT IN (
                  SELECT MIN(id)
                  FROM respuestas
                  WHERE es_correcta = 1
                  GROUP BY pregunta_id
              )
        `);

        await conexion.execAsync(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_respuesta_correcta_unica
            ON respuestas (pregunta_id)
            WHERE es_correcta = 1;

            CREATE INDEX IF NOT EXISTS idx_resultados_leccion_usuario_fecha
            ON resultados_leccion (usuario_id, fecha_resultado);

            DROP INDEX IF EXISTS idx_resultados_leccion_usuario;

            CREATE UNIQUE INDEX IF NOT EXISTS idx_resultado_clave_intento
            ON resultados_leccion (usuario_id, clave_intento)
            WHERE clave_intento IS NOT NULL;

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

        await conexion.execAsync(
            `PRAGMA user_version = ${DB_SCHEMA_VERSION};`
        );
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

        await conexion.runAsync(`
            INSERT OR IGNORE INTO recursos_usuario (
                usuario_id,
                recurso_id,
                cantidad
            )
            SELECT usuarios.id, tipos_recurso.id, 0
            FROM usuarios
            CROSS JOIN tipos_recurso
        `);
    }

    static async sembrarDatosIniciales() {
        const conexion = this.obtenerConexion();
        const firmaContenido = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            JSON.stringify({
                mundos: SEED_MUNDOS,
                dificultades: SEED_DIFICULTADES,
                lecciones: SEED_LECCIONES,
            })
        );
        const firmaGuardada = await conexion.getFirstAsync(
            `
            SELECT valor
            FROM metadatos_app
            WHERE clave = 'firma_contenido_inicial'
            `
        );

        if (firmaGuardada?.valor === firmaContenido) {
            return false;
        }

        await conexion.withTransactionAsync(async () => {
            for (const mundo of SEED_MUNDOS) {
                await conexion.runAsync(
                    `
                    INSERT INTO mundos (id, nombre, orden)
                    VALUES (?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        nombre = excluded.nombre,
                        orden = excluded.orden
                    `,
                    [mundo.id, mundo.nombre, mundo.orden]
                );
            }

            for (const dificultad of SEED_DIFICULTADES) {
                await conexion.runAsync(
                    `
                    INSERT INTO dificultades (id, nombre)
                    VALUES (?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        nombre = excluded.nombre
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
                    ON CONFLICT(id) DO UPDATE SET
                        mundo_id = excluded.mundo_id,
                        dificultad_id = excluded.dificultad_id,
                        nombre = excluded.nombre,
                        descripcion = excluded.descripcion,
                        orden = excluded.orden
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

                await conexion.runAsync(
                    `
                    DELETE FROM preguntas
                    WHERE leccion_id = ? AND orden > ?
                    `,
                    [leccion.id, leccion.preguntas.length]
                );

                for (
                    let preguntaIndex = 0;
                    preguntaIndex < leccion.preguntas.length;
                    preguntaIndex += 1
                ) {
                    const pregunta = leccion.preguntas[preguntaIndex];
                    const ordenPregunta = preguntaIndex + 1;

                    await conexion.runAsync(
                        `
                        INSERT INTO preguntas (
                            leccion_id,
                            texto,
                            instruccion,
                            pista,
                            orden
                        )
                        VALUES (?, ?, ?, ?, ?)
                        ON CONFLICT(leccion_id, orden) DO UPDATE SET
                            texto = excluded.texto,
                            instruccion = excluded.instruccion,
                            pista = excluded.pista
                        `,
                        [
                            leccion.id,
                            pregunta.texto,
                            pregunta.instruccion,
                            pregunta.pista,
                            ordenPregunta,
                        ]
                    );

                    const preguntaGuardada = await conexion.getFirstAsync(
                        `
                        SELECT id
                        FROM preguntas
                        WHERE leccion_id = ? AND orden = ?
                        `,
                        [leccion.id, ordenPregunta]
                    );
                    const preguntaId = preguntaGuardada.id;

                    await conexion.runAsync(
                        `
                        DELETE FROM respuestas
                        WHERE pregunta_id = ? AND orden > ?
                        `,
                        [preguntaId, pregunta.respuestas.length]
                    );
                    await conexion.runAsync(
                        "UPDATE respuestas SET es_correcta = 0 WHERE pregunta_id = ?",
                        [preguntaId]
                    );

                    for (
                        let respuestaIndex = 0;
                        respuestaIndex < pregunta.respuestas.length;
                        respuestaIndex += 1
                    ) {
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
                            ON CONFLICT(pregunta_id, orden) DO UPDATE SET
                                texto = excluded.texto,
                                es_correcta = excluded.es_correcta
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

            await conexion.runAsync(
                `
                INSERT INTO metadatos_app (clave, valor)
                VALUES ('firma_contenido_inicial', ?)
                ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor
                `,
                [firmaContenido]
            );
        });

        return true;
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
        return ejecutarEscrituraSerializada(() =>
            this.registrarUsuarioInterno(usuario)
        );
    }

    static async registrarUsuarioInterno(usuario) {
        const conexion = this.obtenerConexion();
        const fechaActual = nowISO();
        const nombre = String(usuario?.nombre ?? "").trim();
        const correo = String(usuario?.correo ?? "").trim().toLowerCase();
        const contrasena = String(usuario?.contrasena ?? "");

        if (!nombre || !correo || !contrasena) {
            throw new Error("Los datos de registro están incompletos.");
        }

        const contrasenaProcesada = await this.crearHashContrasena(contrasena);
        let usuarioId = null;

        await conexion.withTransactionAsync(async () => {
            const usuarioExistente = await conexion.getFirstAsync(
                `
                SELECT id, nombre, correo
                FROM usuarios
                WHERE LOWER(nombre) = LOWER(?)
                   OR LOWER(correo) = LOWER(?)
                LIMIT 1
                `,
                [nombre, correo]
            );

            if (usuarioExistente) {
                if (
                    usuarioExistente.nombre.toLowerCase() ===
                    nombre.toLowerCase()
                ) {
                    throw new Error("Ese nombre de usuario ya está registrado.");
                }

                throw new Error("Ese correo electrónico ya está registrado.");
            }

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
                    nombre,
                    correo,
                    contrasenaProcesada.hash,
                    contrasenaProcesada.salt,
                    fechaActual,
                    fechaActual,
                    usuario.puntaje ?? 0,
                    usuario.mayorRacha ?? 0,
                    usuario.rachaActual ?? 0,
                    null,
                    usuario.energia ?? MAX_VIDAS,
                    null,
                ]
            );

            usuarioId = resultado.lastInsertRowId;
            await this.inicializarProgresoUsuario(usuarioId);
            await this.inicializarRecursosUsuario(usuarioId);
            await this.registrarActividadDiariaInterna(conexion, usuarioId);
        });

        return this.obtenerUsuarioPorId(usuarioId);
    }

    static async iniciarSesion(nombre, contrasena) {
        return ejecutarEscrituraSerializada(async () => {
            const conexion = this.obtenerConexion();
            const nombreLimpio = String(nombre ?? "").trim();
            const contrasenaLimpia = String(contrasena ?? "");

            if (!nombreLimpio || !contrasenaLimpia) {
                throw new Error("Ingresa tu usuario y contraseña.");
            }

            const usuarioEncontrado = await conexion.getFirstAsync(
                `
                SELECT id, contrasena_hash, contrasena_salt
                FROM usuarios
                WHERE LOWER(nombre) = LOWER(?)
                LIMIT 1
                `,
                [nombreLimpio]
            );

            if (!usuarioEncontrado) {
                throw new Error("El usuario no existe.");
            }

            const contrasenaProcesada = await this.crearHashContrasena(
                contrasenaLimpia,
                usuarioEncontrado.contrasena_salt
            );

            if (contrasenaProcesada.hash !== usuarioEncontrado.contrasena_hash) {
                throw new Error("La contraseña es incorrecta.");
            }

            await conexion.withTransactionAsync(async () => {
                await conexion.runAsync(
                    "UPDATE usuarios SET ultima_sesion = ? WHERE id = ?",
                    [nowISO(), usuarioEncontrado.id]
                );
                await this.registrarActividadDiariaInterna(
                    conexion,
                    usuarioEncontrado.id
                );
            });

            return this.obtenerUsuarioPorId(usuarioEncontrado.id);
        });
    }

    static async obtenerUsuarioPorId(usuarioId) {
        const conexion = this.obtenerConexion();

        return conexion.getFirstAsync(
            `
            SELECT
                id,
                nombre,
                correo,
                fecha_registro,
                ultima_sesion,
                puntaje,
                mayor_racha,
                racha_actual,
                fecha_ultima_actividad,
                energia,
                energia_actualizada_en
            FROM usuarios
            WHERE id = ?
            `,
            [usuarioId]
        );
    }

    static async registrarActividadDiaria(usuarioId) {
        const conexion = this.obtenerConexion();
        return ejecutarEscrituraSerializada(async () => {
            let resultadoRacha = null;

            await conexion.withTransactionAsync(async () => {
                resultadoRacha = await this.registrarActividadDiariaInterna(
                    conexion,
                    usuarioId
                );
            });

            return resultadoRacha;
        });
    }

    static async registrarActividadDiariaInterna(conexion, usuarioId) {
        const fechaHoy = obtenerFechaLocal();
        const fechaActual = nowISO();

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

        const actividadExistente = await conexion.getFirstAsync(
            `
            SELECT 1 AS existe
            FROM actividad_diaria
            WHERE usuario_id = ? AND fecha_local = ?
            LIMIT 1
            `,
            [usuarioId, fechaHoy]
        );

        if (actividadExistente) {
            return {
                rachaActual: usuario.racha_actual,
                mayorRacha: usuario.mayor_racha,
                fechaUltimaActividad: usuario.fecha_ultima_actividad,
            };
        }

        await conexion.runAsync(
            `
            INSERT INTO actividad_diaria (
                usuario_id,
                fecha_local,
                fecha_registro
            )
            VALUES (?, ?, ?)
            `,
            [usuarioId, fechaHoy, fechaActual]
        );

        const diferenciaDias = calcularDiferenciaDias(
            usuario.fecha_ultima_actividad,
            fechaHoy
        );
        const rachaActual =
            diferenciaDias === 1 ? usuario.racha_actual + 1 : 1;
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

        return {
            rachaActual,
            mayorRacha,
            fechaUltimaActividad: fechaHoy,
        };
    }

    static async regenerarEnergia(usuarioId) {
        return ejecutarEscrituraSerializada(() =>
            this.regenerarEnergiaInterna(usuarioId)
        );
    }

    static async regenerarEnergiaInterna(usuarioId) {
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

        const resultado = calcularRegeneracionEnergia({
            energia: usuario.energia,
            marcaTiempo: usuario.energia_actualizada_en,
        });

        if (resultado.requierePersistencia) {
            await conexion.runAsync(
                `
                UPDATE usuarios
                SET energia = ?, energia_actualizada_en = ?
                WHERE id = ?
                `,
                [
                    resultado.energia,
                    resultado.marcaTiempo === null
                        ? null
                        : new Date(resultado.marcaTiempo).toISOString(),
                    usuarioId,
                ]
            );
        }

        return {
            energia: resultado.energia,
            segundosParaSiguienteVida:
                resultado.segundosParaSiguienteVida,
        };
    }

    static async descontarVida(usuarioId) {
        return ejecutarEscrituraSerializada(async () => {
            await this.regenerarEnergiaInterna(usuarioId);

            const conexion = this.obtenerConexion();
            let resultadoDescuento = null;

            await conexion.withTransactionAsync(async () => {
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
                    Math.min(Number(usuario.energia) || 0, MAX_VIDAS)
                );

                if (energiaActual <= 0) {
                    resultadoDescuento = {
                        energia: 0,
                        sinVidas: true,
                        segundosParaSiguienteVida: 0,
                    };
                    return;
                }

                const nuevaEnergia = energiaActual - 1;
                const inicioRegeneracion =
                    usuario.energia_actualizada_en ?? nowISO();

                await conexion.runAsync(
                    `
                    UPDATE usuarios
                    SET energia = ?, energia_actualizada_en = ?
                    WHERE id = ?
                    `,
                    [nuevaEnergia, inicioRegeneracion, usuarioId]
                );

                const marcaTiempo = Date.parse(inicioRegeneracion);
                const regeneracion = calcularRegeneracionEnergia({
                    energia: nuevaEnergia,
                    marcaTiempo,
                });

                resultadoDescuento = {
                    energia: nuevaEnergia,
                    sinVidas: nuevaEnergia === 0,
                    segundosParaSiguienteVida:
                        regeneracion.segundosParaSiguienteVida,
                };
            });

            return resultadoDescuento;
        });
    }

    static async comprarUnaVidaConCristales(usuarioId) {
        return ejecutarEscrituraSerializada(() =>
            this.comprarUnaVidaConCristalesInterna(usuarioId)
        );
    }

    static async comprarUnaVidaConCristalesInterna(usuarioId) {
        if (!usuarioId) {
            throw new Error("No se proporcionó un usuario válido.");
        }

        await this.regenerarEnergiaInterna(usuarioId);

        const conexion = this.obtenerConexion();
        let resultadoCompra = null;

        await conexion.withTransactionAsync(async () => {
            await this.inicializarRecursosUsuario(usuarioId);

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
                Math.min(Number(usuario.energia) || 0, MAX_VIDAS)
            );

            if (energiaActual >= MAX_VIDAS) {
                const error = new Error("Ya tienes todas las vidas.");
                error.code = "VIDAS_COMPLETAS";
                throw error;
            }

            const recurso = await conexion.getFirstAsync(
                `
                SELECT cantidad
                FROM recursos_usuario
                WHERE usuario_id = ? AND recurso_id = 'cristal'
                `,
                [usuarioId]
            );

            const cristalesActuales = Math.max(0, Number(recurso?.cantidad) || 0);

            if (cristalesActuales < COSTO_VIDA_CRISTALES) {
                const error = new Error("No tienes suficientes cristales.");
                error.code = "CRISTALES_INSUFICIENTES";
                throw error;
            }

            const nuevaEnergia = energiaActual + 1;
            const nuevosCristales = cristalesActuales - COSTO_VIDA_CRISTALES;
            const fechaActual = nowISO();

            await conexion.runAsync(
                `
                UPDATE recursos_usuario
                SET cantidad = ?
                WHERE usuario_id = ? AND recurso_id = 'cristal'
                `,
                [nuevosCristales, usuarioId]
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
                VALUES (?, 'cristal', ?, 'compra_vida', NULL, NULL, ?)
                `,
                [usuarioId, -COSTO_VIDA_CRISTALES, fechaActual]
            );

            await conexion.runAsync(
                `
                UPDATE usuarios
                SET energia = ?,
                    energia_actualizada_en = ?
                WHERE id = ?
                `,
                [
                    nuevaEnergia,
                    nuevaEnergia >= MAX_VIDAS
                        ? null
                        : usuario.energia_actualizada_en,
                    usuarioId,
                ]
            );

            resultadoCompra = {
                energia: nuevaEnergia,
                cristales: nuevosCristales,
                costo: COSTO_VIDA_CRISTALES,
            };
        });

        const energiaActualizada = await this.regenerarEnergiaInterna(usuarioId);

        return {
            ...resultadoCompra,
            segundosParaSiguienteVida:
                energiaActualizada.segundosParaSiguienteVida,
        };
    }

    static async obtenerRecursosUsuario(usuarioId) {
        const conexion = this.obtenerConexion();
        const recursos = await conexion.getAllAsync(
            `
            SELECT recurso_id AS recursoId, cantidad
            FROM recursos_usuario
            WHERE usuario_id = ?
            `,
            [usuarioId]
        );

        return mapearRecursos(recursos);
    }

    static async obtenerEstadoJugador(
        usuarioId,
        { registrarActividad = false } = {}
    ) {
        if (!usuarioId) {
            return {
                energia: MAX_VIDAS,
                rachaActual: 0,
                mayorRacha: 0,
                cristales: 0,
                pergaminos: 0,
                segundosParaSiguienteVida: 0,
            };
        }

        return ejecutarEscrituraSerializada(async () => {
            const conexion = this.obtenerConexion();

            if (registrarActividad) {
                await conexion.withTransactionAsync(() =>
                    this.registrarActividadDiariaInterna(conexion, usuarioId)
                );
            }

            const energia = await this.regenerarEnergiaInterna(usuarioId);
            const [recursos, usuario] = await Promise.all([
                this.obtenerRecursosUsuario(usuarioId),
                this.obtenerUsuarioPorId(usuarioId),
            ]);

            return {
                energia: energia.energia,
                segundosParaSiguienteVida:
                    energia.segundosParaSiguienteVida,
                rachaActual: usuario?.racha_actual ?? 0,
                mayorRacha: usuario?.mayor_racha ?? 0,
                cristales: recursos.cristales,
                pergaminos: recursos.pergaminos,
            };
        });
    }

    static async inicializarProgresoUsuario(usuarioId) {
        const conexion = this.obtenerConexion();
        const fechaActual = nowISO();

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
            SELECT
                ?,
                lecciones.id,
                CASE WHEN lecciones.orden = 1 THEN 1 ELSE 0 END,
                0,
                0,
                NULL,
                0,
                CASE WHEN lecciones.orden = 1 THEN ? ELSE NULL END,
                NULL
            FROM lecciones
            `,
            [usuarioId, fechaActual]
        );
    }

    static async inicializarProgresoUsuariosExistentes() {
        const conexion = this.obtenerConexion();
        const fechaActual = nowISO();

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
            SELECT
                usuarios.id,
                lecciones.id,
                CASE WHEN lecciones.orden = 1 THEN 1 ELSE 0 END,
                0,
                0,
                NULL,
                0,
                CASE WHEN lecciones.orden = 1 THEN ? ELSE NULL END,
                NULL
            FROM usuarios
            CROSS JOIN lecciones
            `,
            [fechaActual]
        );
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

        const filasPreguntas = await conexion.getAllAsync(
            `
            WITH preguntas_seleccionadas AS (
                SELECT id, texto, instruccion, pista, orden
                FROM preguntas
                WHERE leccion_id = ?
                ORDER BY orden ASC
                LIMIT 10
            )
            SELECT
                p.id AS preguntaId,
                p.texto AS preguntaTexto,
                p.instruccion,
                p.pista,
                p.orden AS preguntaOrden,
                r.id AS respuestaId,
                r.texto AS respuestaTexto,
                r.es_correcta AS respuestaCorrecta,
                r.orden AS respuestaOrden
            FROM preguntas_seleccionadas p
            LEFT JOIN respuestas r ON r.pregunta_id = p.id
            ORDER BY p.orden ASC, r.orden ASC
            `,
            [idLeccion]
        );

        let preguntaActual = null;

        for (const fila of filasPreguntas) {
            if (!preguntaActual || preguntaActual.id !== fila.preguntaId) {
                preguntaActual = new Pregunta(
                    fila.preguntaId,
                    fila.preguntaTexto,
                    fila.instruccion,
                    fila.pista ?? "",
                    [],
                    null,
                    fila.preguntaOrden
                );
                leccion.agregarPregunta(preguntaActual);
            }

            if (fila.respuestaId !== null) {
                const respuesta = new Respuesta(
                    fila.respuestaId,
                    fila.respuestaTexto,
                    fila.respuestaCorrecta === 1,
                    fila.respuestaOrden
                );

                preguntaActual.agregarRespuesta(respuesta);
            }
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

    static async finalizarLeccion(parametros) {
        return ejecutarEscrituraSerializada(() =>
            this.finalizarLeccionInterna(parametros)
        );
    }

    static async finalizarLeccionInterna({
        usuarioId,
        leccionId,
        correctas,
        errores,
        totalPreguntas,
        tiempoTotalSegundos,
        preguntasRespondidas = correctas + errores,
        completada = true,
        motivoFinalizacion = completada ? "completada" : "sin_vidas",
        claveIntento = null,
    }) {
        if (!usuarioId) {
            throw new Error("No se proporcionó un usuario válido.");
        }

        const conexion = this.obtenerConexion();
        const fechaActual = nowISO();
        const claveIntentoNormalizada =
            claveIntento === null
                ? null
                : String(claveIntento).trim();

        if (
            claveIntento !== null &&
            (!claveIntentoNormalizada || claveIntentoNormalizada.length > 200)
        ) {
            throw new Error("La clave del intento no es válida.");
        }

        const cantidades = [
            correctas,
            errores,
            totalPreguntas,
            preguntasRespondidas,
            tiempoTotalSegundos,
        ];

        if (cantidades.some((cantidad) => !Number.isInteger(cantidad) || cantidad < 0)) {
            throw new Error("Las cantidades del resultado deben ser enteros no negativos.");
        }

        if (
            preguntasRespondidas !== correctas + errores ||
            preguntasRespondidas > totalPreguntas
        ) {
            throw new Error("El resultado de la lección contiene datos inconsistentes.");
        }

        if (completada && preguntasRespondidas !== totalPreguntas) {
            throw new Error(
                "Una lección completada debe incluir todas sus preguntas."
            );
        }

        const precision = calcularPrecision(correctas, totalPreguntas);

        await this.inicializarRecursosUsuario(usuarioId);

        let resultadoFinal = {
            precision,
            completada,
            motivoFinalizacion,
            cristalesGanados: 0,
            pergaminosGanados: 0,
            recursos: {
                cristales: 0,
                pergaminos: 0,
            },
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

            if (claveIntentoNormalizada) {
                const resultadoExistente = await conexion.getFirstAsync(
                    `
                    SELECT
                        leccion_id AS leccionId,
                        precision,
                        completada,
                        motivo_finalizacion AS motivoFinalizacion,
                        cristales_ganados AS cristalesGanados,
                        pergaminos_ganados AS pergaminosGanados
                    FROM resultados_leccion
                    WHERE usuario_id = ? AND clave_intento = ?
                    LIMIT 1
                    `,
                    [usuarioId, claveIntentoNormalizada]
                );

                if (resultadoExistente) {
                    if (
                        Number(resultadoExistente.leccionId) !==
                        Number(leccionId)
                    ) {
                        throw new Error(
                            "La clave del intento ya pertenece a otra lección."
                        );
                    }

                    const recursos = await conexion.getAllAsync(
                        `
                        SELECT recurso_id AS recursoId, cantidad
                        FROM recursos_usuario
                        WHERE usuario_id = ?
                        `,
                        [usuarioId]
                    );
                    const siguienteLeccion =
                        resultadoExistente.completada === 1
                            ? await conexion.getFirstAsync(
                                  `
                                  SELECT id, nombre, descripcion, orden,
                                      mundo_id AS mundoId
                                  FROM lecciones
                                  WHERE mundo_id = ? AND orden = ?
                                  LIMIT 1
                                  `,
                                  [
                                      leccionActual.mundo_id,
                                      leccionActual.orden + 1,
                                  ]
                              )
                            : null;

                    resultadoFinal = {
                        precision: resultadoExistente.precision,
                        completada: resultadoExistente.completada === 1,
                        motivoFinalizacion:
                            resultadoExistente.motivoFinalizacion,
                        cristalesGanados:
                            resultadoExistente.cristalesGanados,
                        pergaminosGanados:
                            resultadoExistente.pergaminosGanados,
                        recursos: mapearRecursos(recursos),
                        siguienteLeccion,
                        siguienteLeccionDesbloqueada: false,
                    };
                    return;
                }
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
                ? calcularCristalesGanados(leccionActual.orden, correctas)
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
                    clave_intento,
                    fecha_resultado
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    claveIntentoNormalizada,
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

            const recursosActuales = mapearRecursos(recursos);

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
