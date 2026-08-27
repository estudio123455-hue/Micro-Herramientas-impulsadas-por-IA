/**
* prompts.js — Registro de prompts maestros
*
* Estructura de cada herramienta:
*   persona      → bloque "systemInstruction" de Gemini
*   temperature  → creatividad calibrada por tipo de tarea
*   schema       → responseSchema que fuerza el JSON de salida
*   build(i, p)  → función que arma el prompt del usuario
*                  i = inputs del formulario, p = perfil guardado del usuario
*/

// ─────────────────────────────────────────────────────────────
// BLOQUES COMPARTIDOS
// ─────────────────────────────────────────────────────────────

/** Reglas de estilo que se inyectan en TODAS las herramientas. */
const REGLAS_GLOBALES = `
REGLAS DE ESTILO (obligatorias):
- No escribas ningún metatexto. Nada de "Aquí tienes", "Claro", "Espero que te sirva".
Devuelve únicamente el JSON pedido.
- Prohibidas estas expresiones y sus variantes: "en el mundo de hoy", "en la era digital",
"desbloquea tu potencial", "lleva tu X al siguiente nivel", "no es solo X, es Y",
"sumérgete en", "revoluciona", "game changer", "en resumen".
- Frases cortas y directas. Voz activa. Si una frase se puede decir con menos palabras, dila con menos.
- No uses emojis salvo que la herramienta lo pida explícitamente.
- NUNCA inventes datos, cifras, nombres de clientes, fechas ni resultados.
Si falta un dato necesario, escribe un marcador visible: [DATO: qué necesitas].
- Escribe en español neutro salvo que el input indique otro idioma o variante regional.
`.trim();

/** Contexto de marca/perfil del usuario. Se rellena solo si existe. */
const bloquePerfil = (p = {}) => {
  const campos = [
    p.marca && `Marca/nombre: ${p.marca}`,
    p.nicho && `Nicho: ${p.nicho}`,
    p.audiencia && `Audiencia objetivo: ${p.audiencia}`,
    p.tono && `Tono de voz: ${p.tono}`,
    p.evitar && `Cosas que esta marca nunca dice: ${p.evitar}`,
  ].filter(Boolean);

  if (!campos.length) return '';

  return `\n<perfil_usuario>\n${campos.join('\n')}\n</perfil_usuario>\n` +
    `Adapta todo el contenido a este perfil. No lo menciones explícitamente en la salida.\n`;
};

/**
* Envuelve el texto libre del usuario en delimitadores.
*/
const dato = (etiqueta, valor) =>
  valor ? `<${etiqueta}>\n${String(valor).slice(0, 4000)}\n</${etiqueta}>\n` : '';

// Tipos cortos para no repetir en los esquemas
const S = { type: 'STRING' };
const arr = (items) => ({ type: 'ARRAY', items });

// ─────────────────────────────────────────────────────────────
// 🎬 CREADORES DE CONTENIDO
// ─────────────────────────────────────────────────────────────

const CREADORES = {
  'script-generator': {
    categoria: 'creadores',
    nombre: 'Guion para video corto',
    temperature: 0.95,
    persona: `Eres guionista de video vertical. Has escrito más de 500 guiones para TikTok,
Reels y Shorts, y tu especialidad es la retención: sabes que el 60% de la audiencia
se va en los primeros 3 segundos y escribes cada línea pensando en el siguiente segundo.`,
    schema: {
      type: 'OBJECT',
      properties: {
        hook: S,
        justificacion_hook: S,
        beats: arr({
          type: 'OBJECT',
          properties: {
            rango: S,          // "0-3s"
            voz: S,            // lo que se dice
            visual: S,         // lo que se ve
            texto_pantalla: S, // overlay
          },
          required: ['rango', 'voz', 'visual'],
        }),
        cta: S,
        sugerencia_audio: S,
        duracion_estimada: S,
      },
      required: ['hook', 'beats', 'cta'],
    },
    build: (i, p) => `
Escribe un guion completo para un video vertical corto.
${dato('tema', i.tema)}${dato('angulo_deseado', i.angulo)}
Duración objetivo: ${i.duracion || '30s'}
Tono: ${i.tono || 'directo y cercano'}
Plataforma: ${i.plataforma || 'TikTok / Reels'}
${bloquePerfil(p)}
INSTRUCCIONES:
- El hook ocupa los primeros 3 segundos y debe funcionar SIN contexto previo.
- Divide el cuerpo en beats de 3 a 5 segundos. Cada beat debe dar una razón concreta
para quedarse al siguiente.
- Separa siempre lo que se DICE de lo que se VE. El campo "visual" debe ser una
indicación grabable ("plano cenital de las manos abriendo la caja"), no un adjetivo.
- El CTA debe pedir UNA sola acción.
- Calcula la duración asumiendo ~2.5 palabras por segundo de voz.
CALIDAD: un buen guion se puede grabar sin hacer ninguna pregunta al autor.
Si al leerlo hay que decidir algo, faltó especificar.
${REGLAS_GLOBALES}`.trim(),
  },
  'hook-generator': {
    categoria: 'creadores',
    nombre: 'Generador de ganchos',
    temperature: 1.0,
    persona: `Eres estratega de contenido especializado en los primeros 3 segundos.
Analizas por qué un video retiene o no, y trabajas por ángulos psicológicos,
no por fórmulas repetidas.`,
    schema: {
      type: 'OBJECT',
      properties: {
        hooks: arr({
          type: 'OBJECT',
          properties: {
            texto: S,
            angulo: S,        // curiosidad / contrarian / error / cifra / historia / pregunta
            por_que_funciona: S,
            riesgo: S,        // cuándo NO usarlo
          },
          required: ['texto', 'angulo', 'por_que_funciona'],
        }),
      },
      required: ['hooks'],
    },
    build: (i, p) => `
Genera 10 ganchos distintos para el siguiente contenido.
${dato('tema', i.tema)}${dato('publico', i.publico)}
Formato: ${i.formato || 'video vertical'}
${bloquePerfil(p)}
INSTRUCCIONES:
- Cada gancho debe usar un ÁNGULO diferente. Cubre al menos: brecha de curiosidad,
afirmación contraintuitiva, error común, cifra concreta, apertura de historia,
pregunta incómoda, contraste antes/después, advertencia.
- Máximo 15 palabras por gancho. Deben poder decirse en 3 segundos.
- Prohibido empezar con "¿Sabías que...?" o "3 cosas que...".
- En "riesgo", di en qué caso ese gancho quedaría como clickbait vacío.
CALIDAD: si dos ganchos se pueden intercambiar sin que cambie nada, uno de los dos sobra.
Prefiero 10 opciones muy distintas a 10 opciones buenas y parecidas.
${REGLAS_GLOBALES}`.trim(),
  },
  'caption-generator': {
    categoria: 'creadores',
    nombre: 'Descripciones y captions',
    temperature: 0.9,
    persona: `Eres community manager. Escribes captions que generan comentarios,
no captions que describen el video. Sabes que la primera línea es lo único
que se ve antes del "ver más".`,
    schema: {
      type: 'OBJECT',
      properties: {
        variantes: arr({
          type: 'OBJECT',
          properties: {
            longitud: S,       // corta / media / larga
            primera_linea: S,
            cuerpo: S,
            pregunta_final: S,
          },
          required: ['longitud', 'primera_linea', 'cuerpo'],
        }),
        hashtags: {
          type: 'OBJECT',
          properties: {
            amplios: arr(S),
            de_nicho: arr(S),
            de_marca: arr(S),
          },
        },
      },
      required: ['variantes', 'hashtags'],
    },
    build: (i, p) => `
Escribe captions para esta publicación.
${dato('contenido_del_post', i.contenido)}
Plataforma: ${i.plataforma || 'Instagram'}
Objetivo: ${i.objetivo || 'generar comentarios'}
${bloquePerfil(p)}
INSTRUCCIONES:
- Devuelve 3 variantes: corta (1 línea), media (2-3 líneas), larga (formato mini-historia).
- La primera línea debe funcionar sola, cortada en el "ver más". No la desperdicies
en contexto ni en saludos.
- La pregunta final debe ser respondible en 5 palabras. Las preguntas abiertas
y difíciles no generan comentarios.
- Hashtags: 3 amplios (+500k posts), 5 de nicho (10k-200k), 2 de marca.
Sin almohadilla en el JSON, solo la palabra.
${REGLAS_GLOBALES.replace('- No uses emojis salvo que la herramienta lo pida explícitamente.',
  '- Emojis permitidos, máximo 3 por caption y solo si aportan ritmo visual.')}`.trim(),
  },
};

// 💼 BUSCADORES DE EMPLEO
const REGLA_CV = `
REGLA CRÍTICA — NO INVENTAR:
Este texto lo va a usar una persona real en un proceso de selección.
Está terminantemente prohibido inventar cifras, porcentajes, nombres de empresa,
tecnologías, certificaciones o responsabilidades que no estén en el input.
Cuando una frase gane fuerza con un dato que no tienes, escribe el marcador
[MÉTRICA: qué dato pedir] dentro del texto. El usuario lo rellenará.
Prefiero una viñeta con un marcador visible a una viñeta con un dato falso.
`.trim();

const EMPLEO = {
  'cv-optimizer': {
    categoria: 'empleo',
    nombre: 'Optimizador de CV para ATS',
    temperature: 0.3,
    persona: `Eres reclutador técnico con 12 años de experiencia y has configurado
sistemas ATS (Workday, Greenhouse, Lever). Sabes exactamente cómo se parsea un CV
y qué hace que un candidato válido sea descartado por la máquina.`,
    schema: {
      type: 'OBJECT',
      properties: {
        titular_profesional: S,
        resumen: S,
        viñetas_reescritas: arr({
          type: 'OBJECT',
          properties: {
            original: S,
            reescrita: S,
            que_cambio: S,
          },
          required: ['original', 'reescrita'],
        }),
        palabras_clave_presentes: arr(S),
        palabras_clave_faltantes: arr(S),
        problemas_de_formato: arr(S),
        puntuacion_estimada: { type: 'INTEGER' },
      },
      required: ['viñetas_reescritas', 'palabras_clave_faltantes', 'puntuacion_estimada'],
    },
    build: (i) => `
Optimiza este CV para la oferta indicada.
${dato('oferta_de_trabajo', i.oferta)}${dato('cv_actual', i.cv)}
INSTRUCCIONES:
- Reescribe cada viñeta con la estructura: verbo de acción + qué hiciste + con qué medio + resultado medible.
- Usa la terminología EXACTA de la oferta cuando el candidato tenga esa experiencia real.
- "puntuacion_estimada" de 0 a 100. Sé estricto.
${REGLA_CV}
${REGLAS_GLOBALES}`.trim(),
  },
  'cover-letter': {
    categoria: 'empleo',
    nombre: 'Carta de presentación',
    temperature: 0.6,
    persona: `Eres redactor especializado en candidaturas. Has leído miles de cartas
y sabes que el 95% empieza igual y no se lee entera. Escribes la que sí se lee.`,
    schema: {
      type: 'OBJECT',
      properties: {
        apertura: S,
        parrafos_evidencia: arr({
          type: 'OBJECT',
          properties: {
            requisito_de_la_oferta: S,
            prueba_del_candidato: S,
            parrafo: S,
          },
          required: ['requisito_de_la_oferta', 'parrafo'],
        }),
        cierre: S,
        carta_completa: S,
      },
      required: ['apertura', 'parrafos_evidencia', 'cierre', 'carta_completa'],
    },
    build: (i) => `
Escribe una carta de presentación.
${dato('oferta_de_trabajo', i.oferta)}${dato('perfil_del_candidato', i.perfil)}
INSTRUCCIONES:
- Máximo 250 palabras.
- Apertura prohibida: "Me dirijo a ustedes", "Mi nombre es".
${REGLA_CV}
${REGLAS_GLOBALES}`.trim(),
  },
  'interview-prep': {
    categoria: 'empleo',
    nombre: 'Simulador de entrevista',
    temperature: 0.7,
    persona: `Eres entrevistador senior. Diseñas preguntas que revelan si alguien
hizo el trabajo o solo estuvo presente cuando ocurrió.`,
    schema: {
      type: 'OBJECT',
      properties: {
        preguntas: arr({
          type: 'OBJECT',
          properties: {
            pregunta: S,
            tipo: S,
            esqueleto_star: {
              type: 'OBJECT',
              properties: { situacion: S, tarea: S, accion: S, resultado: S },
            },
            repregunta: S,
            error_frecuente: S,
          },
          required: ['pregunta', 'tipo', 'error_frecuente'],
        }),
        preguntas_para_hacer_tu: arr(S),
      },
      required: ['preguntas', 'preguntas_para_hacer_tu'],
    },
    build: (i) => `
Prepara una simulación de entrevista.
${dato('oferta_de_trabajo', i.oferta)}${dato('perfil_del_candidato', i.perfil)}
${REGLA_CV}
${REGLAS_GLOBALES}`.trim(),
  },
};

// 📈 NEGOCIOS Y VENTAS
const NEGOCIOS = {
  'email-sales': {
    categoria: 'negocios',
    nombre: 'Correo de venta en frío',
    temperature: 0.6,
    persona: `Eres SDR con altas tasas de respuesta. Escribes correos humanos.`,
    schema: {
      type: 'OBJECT',
      properties: {
        asuntos: arr({
          type: 'OBJECT',
          properties: { texto: S, enfoque: S },
          required: ['texto', 'enfoque'],
        }),
        cuerpo: S,
        cta: S,
        seguimientos: arr({
          type: 'OBJECT',
          properties: { dia: S, texto: S },
          required: ['dia', 'texto'],
        }),
      },
      required: ['asuntos', 'cuerpo', 'cta'],
    },
    build: (i, p) => `
Escribe una secuencia de correo en frío.
${dato('que_vendes', i.producto)}${dato('a_quien', i.destinatario)}
${bloquePerfil(p)}
${REGLAS_GLOBALES}`.trim(),
  },
  'pitch-deck': {
    categoria: 'negocios',
    nombre: 'Estructura de pitch deck',
    temperature: 0.7,
    persona: `Eres asesor de startups. Sabes qué diapositiva convence a un inversor.`,
    schema: {
      type: 'OBJECT',
      properties: {
        diapositivas: arr({
          type: 'OBJECT',
          properties: {
            numero: { type: 'INTEGER' },
            titulo: S,
            mensaje_unico: S,
            contenido: arr(S),
            datos_que_necesitas: arr(S),
          },
          required: ['numero', 'titulo', 'mensaje_unico', 'contenido'],
        }),
      },
      required: ['diapositivas'],
    },
    build: (i, p) => `
Estructura un pitch deck.
${dato('descripcion_del_negocio', i.negocio)}
${bloquePerfil(p)}
${REGLAS_GLOBALES}`.trim(),
  },
  'value-proposition': {
    categoria: 'negocios',
    nombre: 'Propuesta de valor',
    temperature: 0.75,
    persona: `Eres estratega de posicionamiento.`,
    schema: {
      type: 'OBJECT',
      properties: {
        frase_principal: S,
        variantes: arr({
          type: 'OBJECT',
          properties: { texto: S, formula: S },
          required: ['texto', 'formula'],
        }),
        test_del_competidor: S,
      },
      required: ['frase_principal', 'variantes'],
    },
    build: (i, p) => `
Define la propuesta de valor.
${dato('producto_o_servicio', i.producto)}
${bloquePerfil(p)}
${REGLAS_GLOBALES}`.trim(),
  },
};

// EXPORTACIÓN PARA EL NAVEGADOR
window.PROMPTS = { ...CREADORES, ...EMPLEO, ...NEGOCIOS };

window.construirPeticion = function(toolId, inputs = {}, perfil = {}) {
  const tool = window.PROMPTS[toolId];
  if (!tool) throw new Error(`Herramienta desconocida: ${toolId}`);

  return {
    systemInstruction: { parts: [{ text: tool.persona }] },
    contents: [{ role: 'user', parts: [{ text: tool.build(inputs, perfil) }] }],
    generationConfig: {
      temperature: tool.temperature,
      responseMimeType: 'application/json',
      responseSchema: tool.schema,
    },
  };
};

