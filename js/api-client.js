/**
 * js/api-client.js — Única puerta de salida del frontend
 *
 * Sustituye a la llamada directa a generativelanguage.googleapis.com que hay
 * hoy en app.js. A partir de aquí el navegador no sabe qué modelo se usa,
 * ni cómo son los prompts, ni cuál es la key del servidor.
 */

const CLAVE_STORAGE = 'gemini_api_key';

/** La key del usuario sigue viviendo solo en su navegador. */
export const obtenerKeyLocal = () => localStorage.getItem(CLAVE_STORAGE) || null;
export const guardarKeyLocal = (k) => localStorage.setItem(CLAVE_STORAGE, k.trim());
export const borrarKeyLocal = () => localStorage.removeItem(CLAVE_STORAGE);

/**
 * @param {string} tool    id de la herramienta (debe existir en el registro del servidor)
 * @param {object} inputs  campos del formulario
 * @param {object} perfil  perfil de marca guardado
 * @returns {Promise<object>} el JSON estructurado ya parseado
 * @throws {ErrorGeneracion} con .codigo para que la UI decida qué mostrar
 */
export async function generar(tool, inputs, perfil = {}) {
  const key = obtenerKeyLocal();

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Solo se envía si el usuario tiene key propia.
      // Sin ella, el servidor decide si hay demo o PRO disponible.
      ...(key && { 'x-user-key': key }),
    },
    body: JSON.stringify({ tool, inputs, perfil }),
  });

  const cuerpo = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ErrorGeneracion(
      cuerpo.error || 'error_desconocido',
      cuerpo.mensaje || MENSAJES[cuerpo.error] || 'Algo falló. Inténtalo de nuevo.',
      res.status
    );
  }

  return cuerpo.datos;
}

/** Error con código, para que la UI reaccione distinto según el caso. */
export class ErrorGeneracion extends Error {
  constructor(codigo, mensaje, status) {
    super(mensaje);
    this.codigo = codigo;
    this.status = status;
  }
}

/** Textos de respaldo por si el servidor no manda mensaje. */
const MENSAJES = {
  requiere_api_key: 'Necesitas configurar tu API key para generar contenido.',
  key_invalida: 'Esa API key no es válida. Revísala en Google AI Studio.',
  key_con_formato_invalido: 'El formato de la key no parece correcto.',
  cuota_agotada: 'Has superado el límite de peticiones. Espera un minuto.',
  contenido_bloqueado: 'El modelo bloqueó esta petición. Prueba a reformular el texto.',
  respuesta_truncada: 'El resultado se cortó por longitud. Acorta la entrada.',
  tiempo_agotado: 'La petición tardó demasiado. Inténtalo otra vez.',
};
