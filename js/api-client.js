/**
 * js/api-client.js — Única puerta de salida del frontend
 *
 * El navegador solo envía { tool, inputs, perfil } al endpoint propio.
 * La API key del proveedor de IA, el modelo y los prompts viven en el servidor.
 * Nada sensible pasa por el cliente.
 */

/**
 * Envía una petición de generación al backend.
 *
 * @param {string} tool    id de la herramienta registrada en el servidor
 * @param {object} inputs  campos del formulario
 * @param {object} perfil  perfil de marca del usuario (opcional)
 * @returns {Promise<object>} el JSON estructurado devuelto por el servidor
 * @throws {ErrorGeneracion} con .codigo semántico para que la UI reaccione
 */
export async function generar(tool, inputs, perfil = {}) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
