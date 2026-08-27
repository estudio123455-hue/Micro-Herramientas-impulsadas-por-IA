// Configuration - API Key will be loaded from localStorage
let API_KEY = localStorage.getItem('gemini_api_key') || '';

// Usage tracking configuration
const DAILY_LIMIT = 3;
const USAGE_STORAGE_KEY = 'ai_tools_usage';
const PRO_USER_KEY = 'ai_tools_pro_user';

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const categorySections = document.querySelectorAll('.category-section');
const toolCards = document.querySelectorAll('.tool-card');
const dashboardView = document.getElementById('dashboardView');
const toolView = document.getElementById('toolView');
const backBtn = document.getElementById('backBtn');
const themeToggle = document.getElementById('themeToggle');
const generateBtn = document.getElementById('generateBtn');
const toolInput = document.getElementById('toolInput');
const resultContainer = document.getElementById('resultContainer');
const resultContent = document.getElementById('resultContent');
const copyBtn = document.getElementById('copyBtn');
const retryBtn = document.getElementById('retryBtn');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

// API Config Elements
const apiConfigBtn = document.getElementById('apiConfigBtn');
const apiModal = document.getElementById('apiModal');
const modalClose = document.getElementById('modalClose');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiBtn = document.getElementById('saveApiBtn');
const testModeCheckbox = document.getElementById('testMode');
const testApiBtn = document.getElementById('testApiBtn');

// Paywall Modal Elements
const paywallModal = document.getElementById('paywallModal');
const paywallClose = document.getElementById('paywallClose');
const upgradeBtn = document.getElementById('upgradeBtn');
const resetUsageBtn = document.getElementById('resetUsageBtn');

// Demo Elements
const demoSteps = document.getElementById('demoSteps');
const prevStepBtn = document.getElementById('prevStepBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
let currentDemoStep = 1;
const totalDemoSteps = 4;

// Tool elements
const toolIcon = document.getElementById('toolIcon');
const toolTitle = document.getElementById('toolTitle');
const toolDescription = document.getElementById('toolDescription');
const inputLabel = document.getElementById('inputLabel');
const charCounter = document.getElementById('charCounter');
const inputHelp = document.getElementById('inputHelp');
const inputError = document.getElementById('inputError');

// Breadcrumb
const breadcrumb = document.getElementById('breadcrumb');

// Current tool state
let currentTool = null;

// Usage tracking functions
function getTodayDate() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
}

function getUsageData() {
  const stored = localStorage.getItem(USAGE_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    date: getTodayDate(),
    count: 0
  };
}

function checkDailyLimit() {
  // Check if user is PRO
  if (localStorage.getItem(PRO_USER_KEY) === 'true') {
    return { allowed: true, remaining: Infinity };
  }

  const usage = getUsageData();
  const today = getTodayDate();

  // Reset if it's a new day
  if (usage.date !== today) {
    usage.date = today;
    usage.count = 0;
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
  }

  const remaining = DAILY_LIMIT - usage.count;
  return {
    allowed: remaining > 0,
    remaining: remaining,
    used: usage.count,
    limit: DAILY_LIMIT
  };
}

function incrementUsage() {
  // Don't increment for PRO users
  if (localStorage.getItem(PRO_USER_KEY) === 'true') {
    return;
  }

  const usage = getUsageData();
  const today = getTodayDate();

  // Reset if it's a new day
  if (usage.date !== today) {
    usage.date = today;
    usage.count = 0;
  }

  usage.count++;
  localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
}

function showPaywallModal() {
  paywallModal.classList.remove('hidden');
}

function hidePaywallModal() {
  paywallModal.classList.add('hidden');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initToolCards();
  initThemeToggle();
  initGenerateButton();
  initCopyButton();
  initBackButton();
  initApiConfig();
  initPaywallModal();
  initKeyboardShortcuts();
  initFormValidation();
  initTouchGestures();
  initDemoSteps();
  initVideoFallback();
  loadTheme();
  updateUsageDisplay();
});

// Interactive demo (tutorial)
function initDemoSteps() {
  if (!prevStepBtn || !nextStepBtn || !demoSteps) return;

  const updateDemoUI = () => {
    const steps = demoSteps.querySelectorAll('.demo-step');
    steps.forEach((step) => {
      const stepNum = Number(step.dataset.step);
      step.classList.toggle('active', stepNum === currentDemoStep);
    });
    prevStepBtn.disabled = currentDemoStep <= 1;
    nextStepBtn.disabled = currentDemoStep >= totalDemoSteps;
  };

  prevStepBtn.addEventListener('click', () => {
    if (currentDemoStep > 1) {
      currentDemoStep -= 1;
      updateDemoUI();
    }
  });

  nextStepBtn.addEventListener('click', () => {
    if (currentDemoStep < totalDemoSteps) {
      currentDemoStep += 1;
      updateDemoUI();
    }
  });

  updateDemoUI();
}

function initVideoFallback() {
  const video = document.getElementById('tutorialVideo');
  const fallback = document.getElementById('videoFallback');
  if (!video || !fallback) return;

  const showFallback = () => {
    video.style.display = 'none';
    fallback.hidden = false;
  };

  video.addEventListener('error', showFallback, true);
  video.querySelector('source')?.addEventListener('error', showFallback);

  video.addEventListener('loadeddata', () => {
    fallback.hidden = true;
    video.style.display = 'block';
  });

  // Si el mp4 no existe, mostrar fallback sin dejar un reproductor vacío
  fetch('assets/videos/demo-herramienta-ia.mp4', { method: 'HEAD' })
    .then((res) => {
      if (!res.ok) showFallback();
    })
    .catch(showFallback);
}

// Navigation
function initNavigation() {
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      switchCategory(category);
      
      // Update active state
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function switchCategory(category) {
  categorySections.forEach(section => {
    section.classList.add('hidden');
  });
  
  const targetSection = document.getElementById(`${category}-section`);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }
}

// Tool Cards
function initToolCards() {
  toolCards.forEach(card => {
    card.addEventListener('click', () => {
      const toolId = card.dataset.tool;
      openTool(toolId);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openTool(card.dataset.tool);
      }
    });
  });
}

function openTool(toolId) {
  currentTool = toolId;
  const toolData = getToolData(toolId);
  
  if (toolData) {
    // Update tool UI
    toolIcon.textContent = toolData.icon;
    toolTitle.textContent = toolData.title;
    toolDescription.textContent = toolData.description;
    inputLabel.textContent = toolData.inputLabel;
    toolInput.placeholder = toolData.placeholder;
    
    // Reset form
    toolInput.value = '';
    resultContainer.classList.add('hidden');
    resultContent.textContent = '';
    retryBtn.style.display = 'none'; // Hide retry button on tool switch
    validateInput();
    
    // Update breadcrumb
    updateBreadcrumb(toolData);
    
    // Switch views
    dashboardView.classList.add('hidden');
    document.getElementById('tutorialSection')?.classList.add('hidden');
    toolView.classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function updateBreadcrumb(toolData) {
  const categoryMap = {
    'script-generator': 'Creadores',
    'hook-generator': 'Creadores',
    'caption-generator': 'Creadores',
    'cv-optimizer': 'Empleo',
    'cover-letter': 'Empleo',
    'interview-prep': 'Empleo',
    'email-sales': 'Negocios',
    'pitch-deck': 'Negocios',
    'value-proposition': 'Negocios'
  };
  
  const category = categoryMap[currentTool] || 'Dashboard';
  
  breadcrumb.innerHTML = `
    <span class="breadcrumb-item" onclick="goToDashboard()">Dashboard</span>
    <span class="breadcrumb-separator">›</span>
    <span class="breadcrumb-item" onclick="goToCategory('${category}')">${category}</span>
    <span class="breadcrumb-separator">›</span>
    <span class="breadcrumb-item active">${toolData.title}</span>
  `;
}

function goToDashboard() {
  toolView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  document.getElementById('tutorialSection')?.classList.remove('hidden');
  currentTool = null;
  
  breadcrumb.innerHTML = `
    <span class="breadcrumb-item active">Dashboard</span>
  `;
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToCategory(category) {
  const categoryMap = {
    'Creadores': 'creadores',
    'Empleo': 'empleo',
    'Negocios': 'negocios'
  };
  
  const categoryId = categoryMap[category];
  if (categoryId) {
    toolView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    document.getElementById('tutorialSection')?.classList.remove('hidden');
    currentTool = null;
    switchCategory(categoryId);
    updateActiveNavButton(categoryId);
    
    breadcrumb.innerHTML = `
      <span class="breadcrumb-item" onclick="goToDashboard()">Dashboard</span>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item active">${category}</span>
    `;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function getToolData(toolId) {
  const tools = {
    'script-generator': {
      icon: '📝',
      title: 'Generador de Guiones',
      description: 'Crea guiones virales para TikTok, Reels y Shorts',
      inputLabel: '¿De qué quieres hablar en tu video?',
      placeholder: 'Ej: 3 trucos para ahorrar dinero trabajando como freelancer...'
    },
    'hook-generator': {
      icon: '🎣',
      title: 'Generador de Hooks',
      description: 'Ganchos irresistibles para captar atención',
      inputLabel: '¿Cuál es el tema de tu contenido?',
      placeholder: 'Ej: Cómo empezar a invertir con poco dinero...'
    },
    'caption-generator': {
      icon: '✍️',
      title: 'Generador de Captions',
      description: 'Captions engaging para tus publicaciones',
      inputLabel: '¿Qué muestra tu imagen/video?',
      placeholder: 'Ej: Una foto de mi nuevo setup de trabajo remoto...'
    },
    'cv-optimizer': {
      icon: '📄',
      title: 'Optimizador de CV',
      description: 'Mejora tu CV para destacar en procesos',
      inputLabel: 'Pega tu CV actual aquí:',
      placeholder: 'Ej: Juan Pérez - Desarrollador Web con 3 años de experiencia...'
    },
    'cover-letter': {
      icon: '✉️',
      title: 'Carta de Presentación',
      description: 'Cartas personalizadas para cada vacante',
      inputLabel: 'Describe el puesto y la empresa:',
      placeholder: 'Ej: Desarrollador Frontend en TechCorp - Buscan experiencia con React...'
    },
    'interview-prep': {
      icon: '🎤',
      title: 'Preparación de Entrevista',
      description: 'Preguntas y respuestas para entrevistas',
      inputLabel: '¿Para qué puesto te estás preparando?',
      placeholder: 'Ej: Entrevista para puesto de Product Manager en startup de fintech...'
    },
    'email-sales': {
      icon: '📧',
      title: 'Emails de Ventas',
      description: 'Secuencias de email para convertir leads',
      inputLabel: 'Describe tu producto/servicio y el cliente ideal:',
      placeholder: 'Ej: SaaS de gestión de proyectos para equipos remotos...'
    },
    'pitch-deck': {
      icon: '📊',
      title: 'Pitch Deck',
      description: 'Estructura para presentaciones de inversión',
      inputLabel: 'Describe tu startup y el problema que resuelve:',
      placeholder: 'Ej: Plataforma de educación en idiomas con IA...'
    },
    'value-proposition': {
      icon: '💎',
      title: 'Propuesta de Valor',
      description: 'Define y comunica tu propuesta única',
      inputLabel: 'Describe tu negocio y público objetivo:',
      placeholder: 'Ej: Consultoría de marketing digital para PYMEs...'
    }
  };
  
  return tools[toolId] || null;
}

// Back Button
function initBackButton() {
  backBtn.addEventListener('click', () => {
    goToDashboard();
  });
}

// Theme Toggle
function initThemeToggle() {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.querySelector('.theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
    
    localStorage.setItem('theme', newTheme);
  });
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.querySelector('.theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Generate Button
function initGenerateButton() {
  generateBtn.addEventListener('click', () => generateContent(currentTool));
  retryBtn.addEventListener('click', () => generateContent(currentTool));
}

// Main function to generate content using AI
async function generateContent(toolType) {
  const input = toolInput.value.trim();
  
  if (!input) {
    showToast('error', 'Campo vacío', 'Por favor, completa el campo de texto antes de generar.');
    toolInput.focus();
    toolInput.classList.add('invalid');
    inputError.textContent = 'El campo no puede estar vacío';
    inputError.classList.add('visible');
    return;
  }
  
  if (!API_KEY) {
    showToast('error', 'API Key requerida', 'Configura tu API Key en el icono ⚙️');
    openApiModal();
    return;
  }
  
  // Check daily limit
  const limitCheck = checkDailyLimit();
  if (!limitCheck.allowed) {
    showPaywallModal();
    return;
  }
  
  // Show remaining uses to user (toast, no native confirm)
  if (limitCheck.remaining <= 1 && limitCheck.remaining !== Infinity) {
    showToast('info', 'Última generación gratis', `Te queda ${limitCheck.remaining} de ${limitCheck.limit} hoy.`, 4000);
  }
  
  // Check if using test mode
  if (API_KEY === 'TEST_MODE') {
    console.log('🧪 Usando modo de prueba - no se consumirá cuota de API');
  }
  
  // Show loading state
  generateBtn.disabled = true;
  generateBtn.classList.add('loading');
  generateBtn.innerHTML = '<span class="btn-icon">⏳</span> Generando...';
  resultContainer.classList.remove('hidden');
  resultContent.textContent = 'Generando respuesta con IA...';
  
  try {
    const inputs = getInputsForTool(toolType, input);
    const payload = window.construirPeticion(toolType, inputs);
    const response = await callGeminiAPI(payload, toolType);
    
    // Increment usage counter after successful generation
    incrementUsage();
    updateUsageDisplay();
    
    // Format response (now it's JSON)
    resultContent.innerHTML = formatJsonResponse(response);
    
    // Show success feedback
    generateBtn.classList.remove('loading');
    generateBtn.classList.add('success');
    generateBtn.innerHTML = '<span class="btn-icon">✅</span> Generado';
    showToast('success', '¡Éxito!', 'Contenido generado correctamente');
    
    // Hide retry button on success
    retryBtn.style.display = 'none';
    
    setTimeout(() => {
      generateBtn.classList.remove('success');
      generateBtn.innerHTML = '<span class="btn-icon">✨</span> Generar con IA';
    }, 2000);
    
  } catch (error) {
    console.error('Error:', error);
    handleApiError(error);
    
    // Show error feedback
    generateBtn.classList.remove('loading');
    generateBtn.classList.add('error');
    generateBtn.innerHTML = '<span class="btn-icon">❌</span> Error';
    
    // Show retry button
    retryBtn.style.display = 'flex';
    
    setTimeout(() => {
      generateBtn.classList.remove('error');
      generateBtn.innerHTML = '<span class="btn-icon">✨</span> Generar con IA';
    }, 2000);
  } finally {
    generateBtn.disabled = false;
  }
}

async function callGeminiAPI(payload, toolType = null) {
  // Test mode: if API key contains "TEST", return simulated response
  if (API_KEY === 'TEST_MODE') {
    return simulateAIResponse(toolType || currentTool, payload);
  }
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP Error ${response.status}: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const rawText = data.candidates[0].content.parts[0].text;
      return parseModelJson(rawText);
    }
    
    throw new Error('Formato de respuesta inválido de la API');
    
  } catch (error) {
    console.error('❌ Error en llamada API:', error);
    throw error;
  }
}

function parseModelJson(rawText) {
  const trimmed = String(rawText || '').trim();
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      return JSON.parse(fenced[1].trim());
    }
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('La API no devolvió JSON válido');
  }
}

function getInputsForTool(toolId, input) {
  const text = input.trim();
  switch (toolId) {
    case 'script-generator':
    case 'hook-generator':
      return { tema: text };
    case 'caption-generator':
      return { contenido: text, tema: text };
    case 'cv-optimizer':
      return { cv: text, oferta: text };
    case 'cover-letter':
    case 'interview-prep':
      return { oferta: text, perfil: text };
    case 'email-sales':
      return { producto: text, destinatario: text };
    case 'pitch-deck':
      return { negocio: text };
    case 'value-proposition':
      return { producto: text, negocio: text };
    default:
      return { tema: text };
  }
}

function formatJsonResponse(data) {
  if (!data || typeof data !== 'object') {
    return `<div class="ai-response-content"><p>${escapeHtml(String(data ?? ''))}</p></div>`;
  }

  let html = '<div class="ai-response-content">';

  for (const [key, value] of Object.entries(data)) {
    const label = key.replace(/_/g, ' ').toUpperCase();

    if (Array.isArray(value)) {
      html += `<div class="response-section"><h3>${escapeHtml(label)}</h3><ul>`;
      value.forEach((item) => {
        if (item && typeof item === 'object') {
          html += `<li>${formatObjectLines(item)}</li>`;
        } else {
          html += `<li>${escapeHtml(String(item))}</li>`;
        }
      });
      html += '</ul></div>';
    } else if (value && typeof value === 'object') {
      html += `<div class="response-section"><h3>${escapeHtml(label)}</h3>${formatObjectLines(value, true)}</div>`;
    } else {
      html += `<div class="response-section"><h3>${escapeHtml(label)}</h3><p>${escapeHtml(String(value ?? ''))}</p></div>`;
    }
  }

  html += '</div>';
  return html;
}

function formatObjectLines(obj, asParagraphs = false) {
  return Object.entries(obj).map(([k, v]) => {
    let rendered;
    if (Array.isArray(v)) {
      rendered = v.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(', ');
    } else if (v && typeof v === 'object') {
      rendered = Object.entries(v).map(([sk, sv]) => `${sk}: ${sv}`).join(' · ');
    } else {
      rendered = String(v ?? '');
    }
    const line = `<strong>${escapeHtml(k)}:</strong> ${escapeHtml(rendered)}`;
    return asParagraphs ? `<p>${line}</p>` : line;
  }).join(asParagraphs ? '' : ' | ');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Simulate AI response for testing purposes (JSON aligned with prompts.js schemas)
function simulateAIResponse(toolType) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockResponse(toolType));
    }, 800);
  });
}

function getMockResponse(toolType) {
  const mocks = {
    'script-generator': {
      hook: 'Deja de perder 2 horas al día en tareas que ya puedes automatizar.',
      justificacion_hook: 'Promete un beneficio concreto sin contexto previo.',
      beats: [
        { rango: '0-3s', voz: 'Si trabajas solo, esto te va a doler.', visual: 'Primer plano serio a cámara', texto_pantalla: '2h/día' },
        { rango: '3-8s', voz: 'La mayoría pierde tiempo copiando datos entre apps.', visual: 'Pantalla con tabs abiertas', texto_pantalla: 'Copia / pega' },
        { rango: '8-15s', voz: 'Conecta una sola herramienta y recupera ese bloque.', visual: 'Demo rápida del flujo', texto_pantalla: '1 flujo' },
      ],
      cta: 'Guarda el video y pruébalo mañana a primera hora.',
      sugerencia_audio: 'Beat energético sin letra',
      duracion_estimada: '15s',
    },
    'hook-generator': {
      hooks: [
        { texto: 'El error que te hace perder clientes en silencio', angulo: 'error', por_que_funciona: 'Amenaza concreta', riesgo: 'Si no explicas el error, suena clickbait' },
        { texto: 'Hice esto 7 días y cambió mi cierre', angulo: 'historia', por_que_funciona: 'Promesa de prueba', riesgo: 'Sin prueba real pierde credibilidad' },
        { texto: 'Nadie te dijo esto sobre vender por DM', angulo: 'curiosidad', por_que_funciona: 'Brecha de información', riesgo: 'Si el tip es obvio, baja retención' },
      ],
    },
    'caption-generator': {
      variantes: [
        { longitud: 'corta', primera_linea: 'Esto me hubiera ahorrado meses.', cuerpo: 'Una decisión simple cambió mi ritmo de trabajo.', pregunta_final: '¿Tú ya lo usas?' },
        { longitud: 'media', primera_linea: 'Dejé de improvisar mis captions.', cuerpo: 'Ahora escribo primero la línea que se ve antes del “ver más”. El resto solo sostiene la conversación.', pregunta_final: '¿Cuál es tu truco?' },
        { longitud: 'larga', primera_linea: 'Antes publicaba y nadie respondía.', cuerpo: 'Cambié el orden: gancho, prueba corta y una pregunta fácil. En una semana subieron los comentarios.', pregunta_final: '¿Te ayudo con el tuyo?' },
      ],
      hashtags: { amplios: ['marketing', 'contenido', 'emprendimiento'], de_nicho: ['captions', 'reelstips', 'communitymanager', 'copywriting', 'crecimientoig'], de_marca: ['aitools', 'microherramientas'] },
    },
    'cv-optimizer': {
      titular_profesional: 'Especialista en operaciones digitales con foco en eficiencia',
      resumen: 'Perfil orientado a resultados medibles y procesos claros. [MÉTRICA: impacto cuantificable reciente]',
      viñetas_reescritas: [
        { original: 'Responsable de mejorar procesos', reescrita: 'Rediseñé el flujo operativo con [herramienta], reduciendo tiempos de [MÉTRICA: % o horas]', que_cambio: 'Añade verbo + medio + resultado' },
      ],
      palabras_clave_presentes: ['gestión', 'procesos'],
      palabras_clave_faltantes: ['KPI', 'automatización', 'stakeholders'],
      problemas_de_formato: ['Evita tablas complejas para ATS', 'Usa viñetas simples'],
      puntuacion_estimada: 72,
    },
    'cover-letter': {
      apertura: 'Vi que buscan a alguien que ordene el caos operativo sin frenar al equipo.',
      parrafos_evidencia: [
        { requisito_de_la_oferta: 'Mejora de procesos', prueba_del_candidato: '[DATO: ejemplo real del candidato]', parrafo: 'En mi último rol ordené el flujo de [proceso] y dejé documentado un estándar usable por todo el equipo.' },
      ],
      cierre: 'Me gustaría conversar sobre cómo aplicar este enfoque en su equipo.',
      carta_completa: 'Vi que buscan a alguien que ordene el caos operativo sin frenar al equipo.\n\nEn mi último rol ordené el flujo de [proceso] y dejé documentado un estándar usable por todo el equipo.\n\nMe gustaría conversar sobre cómo aplicar este enfoque en su equipo.',
    },
    'interview-prep': {
      preguntas: [
        {
          pregunta: 'Cuéntame un proceso que mejoraste de punta a punta.',
          tipo: 'conductual',
          esqueleto_star: { situacion: 'Había cuellos de botella en [área]', tarea: 'Reducir tiempos sin perder calidad', accion: 'Mapeé el flujo y eliminé pasos redundantes', resultado: '[MÉTRICA: resultado]' },
          repregunta: '¿Qué harías diferente hoy?',
          error_frecuente: 'Hablar en plural sin explicar tu rol concreto',
        },
      ],
      preguntas_para_hacer_tu: ['¿Cómo miden el éxito en los primeros 90 días?', '¿Cuál es el mayor cuello de botella actual del equipo?'],
    },
    'email-sales': {
      asuntos: [
        { texto: 'Idea rápida para [empresa]', enfoque: 'valor' },
        { texto: '¿Esto les está pasando?', enfoque: 'dolor' },
      ],
      cuerpo: 'Hola [Nombre],\n\nVi que están creciendo el equipo y suele aparecer fricción en [proceso]. Ayudamos a equipos similares a ordenarlo sin sumar software de más.\n\n¿Te sirve si te mando un ejemplo de 2 minutos?',
      cta: '¿Te parece bien el jueves a las 10?',
      seguimientos: [
        { dia: 'Día 3', texto: 'Te dejo el ejemplo corto por si no lo viste.' },
        { dia: 'Día 7', texto: 'Cierro el hilo por ahora. Si encaja más adelante, aquí estoy.' },
      ],
    },
    'pitch-deck': {
      diapositivas: [
        { numero: 1, titulo: 'Problema', mensaje_unico: 'El dolor es caro y frecuente', contenido: ['Quién lo sufre', 'Con qué frecuencia', 'Qué cuesta hoy'], datos_que_necesitas: ['Tamaño de mercado', 'Costo actual del problema'] },
        { numero: 2, titulo: 'Solución', mensaje_unico: 'Producto simple que elimina el dolor', contenido: ['Cómo funciona', 'Por qué ahora'], datos_que_necesitas: ['Demo o captura'] },
        { numero: 3, titulo: 'Mercado', mensaje_unico: 'Oportunidad concreta', contenido: ['TAM/SAM/SOM resumido'], datos_que_necesitas: ['Cifras de mercado'] },
      ],
    },
    'value-proposition': {
      frase_principal: 'Ayudamos a [audiencia] a [resultado] sin [sacrificio habitual].',
      variantes: [
        { texto: 'Para equipos que ya no quieren improvisar su operación.', formula: 'audiencia + dolor' },
        { texto: 'El atajo claro entre el caos diario y un sistema repetible.', formula: 'antes/después' },
      ],
      test_del_competidor: 'Si un competidor puede decir exactamente lo mismo, falta especificidad.',
    },
  };

  return mocks[toolType] || {
    resultado: 'Respuesta de prueba generada en modo TEST_MODE.',
    nota: 'Configura tu API Key real para usar Gemini.',
  };
}

// Format response with proper line breaks and markdown
function formatResponse(text) {
  // Convert markdown-style formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Code blocks
    .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
    .replace(/\n\n/g, '</p><p>') // Paragraphs
    .replace(/\n/g, '<br>') // Line breaks
    .replace(/^- (.*)$/gm, '<li>$1</li>') // Bullet points
    .replace(/^(\d+)\. (.*)$/gm, '<strong>$1.</strong> $2') // Numbered lists
    .replace(/^### (.*)$/gm, '<h3>$1</h3>') // Headers
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^(.+)$/gm, '<p>$1</p>') // Wrap remaining text in paragraphs
    .replace(/<p><\/p>/g, '') // Remove empty paragraphs
    .replace(/<p>(<h[1-6]>)/g, '$1') // Fix paragraph/header combinations
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1'); // Fix header/paragraph combinations
}

// Handle API errors with user-friendly messages
function handleApiError(error) {
  let errorMessage = 'Error al generar la respuesta.';
  
  if (error.message.includes('401') || error.message.includes('403')) {
    errorMessage = 'Error de autenticación. Verifica que tu API Key sea correcta.';
  } else if (error.message.includes('429')) {
    errorMessage = 'Límite de cuota excedido. Intenta nuevamente en unos minutos.';
  } else if (error.message.includes('400')) {
    errorMessage = 'Error en la solicitud. Verifica tu entrada.';
  } else if (error.message.includes('network') || error.message.includes('fetch')) {
    errorMessage = 'Error de conexión. Verifica tu internet.';
  }
  
  resultContent.innerHTML = `
    <div class="error-message">
      <strong>❌ ${errorMessage}</strong>
      <br><br>
      <small>Detalle: ${error.message}</small>
    </div>
  `;
}

// Copy Button
function initCopyButton() {
  copyBtn.addEventListener('click', handleCopy);
}

async function handleCopy() {
  const textToCopy = resultContent.textContent; // Use textContent to get plain text without HTML
  
  try {
    await navigator.clipboard.writeText(textToCopy);
    
    // Show enhanced feedback
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span class="copy-icon">✅</span> ¡Copiado! ✓';
    copyBtn.classList.add('copied');
    copyBtn.setAttribute('aria-label', 'Texto copiado al portapapeles');
    
    showToast('success', '¡Copiado!', 'El texto ha sido copiado al portapapeles');
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.classList.remove('copied');
      copyBtn.setAttribute('aria-label', 'Copiar al portapapeles');
    }, 2000);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    copyBtn.classList.add('error');
    copyBtn.innerHTML = '<span class="copy-icon">❌</span> Error';
    
    setTimeout(() => {
      copyBtn.classList.remove('error');
      copyBtn.innerHTML = '<span class="copy-icon">📋</span> Copiar';
    }, 2000);
    
    showToast('error', 'Error', 'No se pudo copiar al portapapeles');
  }
}

// Paywall Modal initialization
function initPaywallModal() {
  paywallClose.addEventListener('click', hidePaywallModal);
  upgradeBtn.addEventListener('click', () => {
    // Simulate upgrade process
    showToast('info', 'Upgrade a PRO', '¡Gracias por tu interés! Esta es una demo de pago.');
    // For demo purposes, unlock PRO
    localStorage.setItem(PRO_USER_KEY, 'true');
    hidePaywallModal();
    updateUsageDisplay();
    showToast('success', 'PRO Activado', 'Versión PRO activada (demo) - ¡Generaciones ilimitadas!');
  });
  
  // Reset usage button (for testing purposes)
  resetUsageBtn.addEventListener('click', () => {
    if (resetUsageBtn.dataset.confirm !== '1') {
      resetUsageBtn.dataset.confirm = '1';
      resetUsageBtn.title = 'Haz clic de nuevo para confirmar';
      showToast('info', 'Confirmar reset', 'Haz clic otra vez en 🔄 para resetear el contador.', 4000);
      setTimeout(() => {
        resetUsageBtn.dataset.confirm = '0';
        resetUsageBtn.title = 'Resetear contador (solo pruebas)';
      }, 4000);
      return;
    }

    resetUsageBtn.dataset.confirm = '0';
    resetUsageBtn.title = 'Resetear contador (solo pruebas)';
    localStorage.removeItem(USAGE_STORAGE_KEY);
    localStorage.removeItem(PRO_USER_KEY);
    updateUsageDisplay();
    showToast('success', 'Contador reseteado', 'Tienes 3 generaciones gratuitas nuevamente.');
  });
  
  // Close modal when clicking outside
  paywallModal.addEventListener('click', (e) => {
    if (e.target === paywallModal) {
      hidePaywallModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !paywallModal.classList.contains('hidden')) {
      hidePaywallModal();
    }
  });
}

// Toast Notification System
function showToast(type, title, message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${icons[type] || icons.info}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideOutToast 0.3s ease forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// Update usage display in UI
function updateUsageDisplay() {
  const usage = checkDailyLimit();
  const usageDisplay = document.getElementById('usageDisplay');
  
  if (usageDisplay) {
    if (usage.remaining === Infinity) {
      usageDisplay.innerHTML = '<span class="pro-badge">PRO</span> <span class="usage-text">Ilimitado</span>';
    } else {
      usageDisplay.innerHTML = `<span class="usage-count">${usage.remaining}/${usage.limit}</span> <span class="usage-text">hoy</span>`;
    }
  } else {
    console.warn('Usage display element not found');
  }
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // Category navigation (1, 2, 3)
    if (e.key === '1') {
      e.preventDefault();
      switchCategory('creadores');
      updateActiveNavButton('creadores');
    } else if (e.key === '2') {
      e.preventDefault();
      switchCategory('empleo');
      updateActiveNavButton('empleo');
    } else if (e.key === '3') {
      e.preventDefault();
      switchCategory('negocios');
      updateActiveNavButton('negocios');
    }

    // Theme toggle (T)
    if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      themeToggle.click();
    }

    // API config (A)
    if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      apiConfigBtn.click();
    }

    // Reset usage (R)
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      resetUsageBtn.click();
    }

    // Go back to dashboard (Escape)
    if (e.key === 'Escape' && !toolView.classList.contains('hidden')) {
      backBtn.click();
    }

    // Focus on textarea when tool is open (/)
    if (e.key === '/' && !toolView.classList.contains('hidden')) {
      e.preventDefault();
      toolInput.focus();
    }
  });
}

function updateActiveNavButton(category) {
  navButtons.forEach(btn => {
    btn.classList.remove('active');
    btn.removeAttribute('aria-current');
    if (btn.dataset.category === category) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'page');
    }
  });
}

// Touch Gestures for Mobile
function initTouchGestures() {
  let touchStartX = 0;
  let touchEndX = 0;
  
  // Swipe navigation for categories
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    // Only handle swipes on dashboard view
    if (!toolView.classList.contains('hidden')) return;
    
    if (Math.abs(diff) > swipeThreshold) {
      const categories = ['creadores', 'empleo', 'negocios'];
      const currentCategory = document.querySelector('.nav-btn.active')?.dataset.category;
      const currentIndex = categories.indexOf(currentCategory);
      
      if (diff > 0 && currentIndex < categories.length - 1) {
        // Swipe left - next category
        switchCategory(categories[currentIndex + 1]);
        updateActiveNavButton(categories[currentIndex + 1]);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - previous category
        switchCategory(categories[currentIndex - 1]);
        updateActiveNavButton(categories[currentIndex - 1]);
      }
    }
  }
  
  // Double tap to go back to dashboard
  let lastTap = 0;
  document.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      if (!toolView.classList.contains('hidden')) {
        e.preventDefault();
        backBtn.click();
      }
    }
    lastTap = currentTime;
  });
  
  // Long press for tool card context menu (additional info)
  toolCards.forEach(card => {
    let pressTimer;
    
    card.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => {
        showToolInfo(card.dataset.tool);
      }, 500);
    });
    
    card.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });
    
    card.addEventListener('touchmove', () => {
      clearTimeout(pressTimer);
    });
  });
}

function showToolInfo(toolId) {
  const toolData = getToolData(toolId);
  if (toolData) {
    showToast('info', toolData.title, toolData.description, 4000);
  }
}

// Form Validation
function initFormValidation() {
  toolInput.addEventListener('input', validateInput);
  toolInput.addEventListener('blur', validateInput);
}

function validateInput() {
  const value = toolInput.value;
  const length = value.length;
  const minLength = 10;
  const maxLength = 5000;
  
  // Update character counter
  charCounter.textContent = `${length}/${maxLength}`;
  
  // Update counter color based on length
  charCounter.classList.remove('warning', 'error');
  if (length > maxLength * 0.9) {
    charCounter.classList.add('warning');
  } else if (length >= maxLength) {
    charCounter.classList.add('error');
  }
  
  // Validate input
  let isValid = true;
  let errorMessage = '';
  
  if (length > 0 && length < minLength) {
    isValid = false;
    errorMessage = `Mínimo ${minLength} caracteres requeridos (${length}/${minLength})`;
  } else if (length > maxLength) {
    isValid = false;
    errorMessage = `Máximo ${maxLength} caracteres excedido (${length}/${maxLength})`;
  }
  
  // Update input styling
  toolInput.classList.remove('valid', 'invalid');
  if (length > 0) {
    toolInput.classList.add(isValid ? 'valid' : 'invalid');
  }
  
  // Update error message
  if (errorMessage) {
    inputError.textContent = errorMessage;
    inputError.classList.add('visible');
    inputHelp.style.display = 'none';
  } else {
    inputError.classList.remove('visible');
    inputHelp.style.display = 'block';
  }
  
  // Enable/disable generate button
  generateBtn.disabled = !isValid || length === 0;
  
  return isValid;
}

// Get prompt for current tool (imported from prompts.js)
function getPromptForTool(toolId) {
  if (window.PROMPTS && window.PROMPTS[toolId]) {
    return window.PROMPTS[toolId];
  }
  
  // Fallback prompt
  return 'Eres un asistente útil. Responde de manera clara y concisa.';
}

// Automated test function for API endpoint
async function testApiEndpoint() {
  console.log('🧪 Iniciando prueba automática del endpoint...');

  try {
    const payload = window.construirPeticion('hook-generator', {
      tema: 'Responde solo si puedes leer este mensaje de prueba.',
    });
    const result = await callGeminiAPI(payload, 'hook-generator');
    console.log('✅ Prueba automática exitosa:', result);
    return true;
  } catch (error) {
    console.error('❌ Prueba automática fallida:', error);
    return false;
  }
}

// Manual test function for API connection
async function testApiConnection() {
  const testKey = apiKeyInput.value.trim();
  
  if (!testKey) {
    showToast('error', 'API Key requerida', 'Ingresa una API Key para probar la conexión.');
    return;
  }
  
  // Temporarily use the test key
  const originalKey = API_KEY;
  API_KEY = testKey;
  
  testApiBtn.textContent = '⏳ Probando...';
  testApiBtn.disabled = true;
  
  try {
    const success = await testApiEndpoint();
    
    if (success) {
      testApiBtn.textContent = '✅ Conexión exitosa';
      testApiBtn.style.background = '#10b981';
      testApiBtn.style.color = 'white';
      testApiBtn.style.borderColor = '#10b981';
      
      setTimeout(() => {
        testApiBtn.textContent = '🧪 Probar Conexión';
        testApiBtn.style.background = '';
        testApiBtn.style.color = '';
        testApiBtn.style.borderColor = '';
        testApiBtn.disabled = false;
      }, 2000);
      
      showToast('success', 'Conexión exitosa', 'La API Key funciona correctamente. HTTP 200 OK recibido.');
    } else {
      throw new Error('La prueba de conexión falló');
    }
  } catch (error) {
    testApiBtn.textContent = '❌ Error de conexión';
    testApiBtn.style.background = '#ef4444';
    testApiBtn.style.color = 'white';
    testApiBtn.style.borderColor = '#ef4444';
    
    setTimeout(() => {
      testApiBtn.textContent = '🧪 Probar Conexión';
      testApiBtn.style.background = '';
      testApiBtn.style.color = '';
      testApiBtn.style.borderColor = '';
      testApiBtn.disabled = false;
    }, 2000);
    
    showToast('error', 'Error de conexión', `${error.message}. Verifica tu API Key e intenta nuevamente.`);
  } finally {
    // Restore original key
    API_KEY = originalKey;
  }
}

// API Configuration Modal
function initApiConfig() {
  apiConfigBtn.addEventListener('click', openApiModal);
  modalClose.addEventListener('click', closeApiModal);
  saveApiBtn.addEventListener('click', saveApiKey);
  testApiBtn.addEventListener('click', testApiConnection);
  
  // Close modal when clicking outside
  apiModal.addEventListener('click', (e) => {
    if (e.target === apiModal) {
      closeApiModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !apiModal.classList.contains('hidden')) {
      closeApiModal();
    }
  });
  
  // Load saved API key into input
  if (API_KEY) {
    if (API_KEY === 'TEST_MODE') {
      testModeCheckbox.checked = true;
      apiKeyInput.value = '';
    } else {
      apiKeyInput.value = API_KEY;
    }
  }
}

function openApiModal() {
  apiModal.classList.remove('hidden');
  apiKeyInput.value = API_KEY === 'TEST_MODE' ? '' : API_KEY;
  testModeCheckbox.checked = API_KEY === 'TEST_MODE';
  apiKeyInput.focus();
}

function closeApiModal() {
  apiModal.classList.add('hidden');
}

function saveApiKey() {
  if (testModeCheckbox.checked) {
    API_KEY = 'TEST_MODE';
    localStorage.setItem('gemini_api_key', API_KEY);
    
    // Show success feedback
    saveApiBtn.textContent = '✅ Guardado';
    saveApiBtn.style.background = '#10b981';
    
    setTimeout(() => {
      saveApiBtn.textContent = 'Guardar API Key';
      saveApiBtn.style.background = '';
      closeApiModal();
    }, 1500);
  } else {
    const newApiKey = apiKeyInput.value.trim();
    
    if (!newApiKey) {
      showToast('error', 'API Key requerida', 'Ingresa una API Key válida o activa el modo de prueba.');
      return;
    }
    
    API_KEY = newApiKey;
    localStorage.setItem('gemini_api_key', API_KEY);
    
    // Show success feedback
    saveApiBtn.textContent = '✅ Guardado';
    saveApiBtn.style.background = '#10b981';
    
    setTimeout(() => {
      saveApiBtn.textContent = 'Guardar API Key';
      saveApiBtn.style.background = '';
      closeApiModal();
    }, 1500);
  }
}

// Expose breadcrumb helpers used by inline onclick handlers
window.goToDashboard = goToDashboard;
window.goToCategory = goToCategory;
