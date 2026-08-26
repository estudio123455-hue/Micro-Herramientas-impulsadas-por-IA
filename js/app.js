// Configuration - API Key will be loaded from localStorage
let API_KEY = localStorage.getItem('gemini_api_key') || 'AIzaSyABCW7Pn61txGF4tOR_rlGTjOV5cqmYI7o';

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

// Tool elements
const toolIcon = document.getElementById('toolIcon');
const toolTitle = document.getElementById('toolTitle');
const toolDescription = document.getElementById('toolDescription');
const inputLabel = document.getElementById('inputLabel');

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
  loadTheme();
  updateUsageDisplay();
});

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
    
    // Switch views
    dashboardView.classList.add('hidden');
    toolView.classList.remove('hidden');
    
    // Scroll to top
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
    toolView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    currentTool = null;
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
}

// Main function to generate content using AI
async function generateContent(toolType) {
  const input = toolInput.value.trim();
  
  if (!input) {
    alert('Por favor, completa el campo de texto antes de generar.');
    return;
  }
  
  if (!API_KEY) {
    alert('Por favor, configura tu API Key primero. Haz clic en el icono ⚙️ en la esquina superior derecha.');
    openApiModal();
    return;
  }
  
  // Check daily limit
  const limitCheck = checkDailyLimit();
  if (!limitCheck.allowed) {
    showPaywallModal();
    return;
  }
  
  // Show remaining uses to user
  if (limitCheck.remaining <= 1) {
    const confirmContinue = confirm(`⚠️ ¡Última generación gratuita del día!\n\nUsos restantes hoy: ${limitCheck.remaining}/${limitCheck.limit}\n\n¿Continuar?`);
    if (!confirmContinue) {
      return;
    }
  }
  
  // Check if using test mode
  if (API_KEY === 'TEST_MODE') {
    console.log('🧪 Usando modo de prueba - no se consumirá cuota de API');
  }
  
  // Show loading state
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span class="btn-icon">⏳</span> Generando...';
  resultContainer.classList.remove('hidden');
  resultContent.textContent = 'Generando respuesta con IA...';
  
  try {
    const systemPrompt = getPromptForTool(toolType);
    const response = await callGeminiAPI(systemPrompt, input);
    
    // Increment usage counter after successful generation
    incrementUsage();
    updateUsageDisplay();
    
    // Format response with proper line breaks
    resultContent.innerHTML = formatResponse(response);
  } catch (error) {
    console.error('Error:', error);
    handleApiError(error);
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span class="btn-icon">✨</span> Generar con IA';
  }
}

async function callGeminiAPI(systemPrompt, userInput) {
  // Test mode: if API key contains "TEST", return simulated response
  if (API_KEY === 'TEST_MODE') {
    return simulateAIResponse(systemPrompt, userInput);
  }
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${API_KEY}`;
  
  console.log('🔍 Llamando a API:', apiUrl);
  console.log('📝 Prompt length:', systemPrompt.length + userInput.length);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nEntrada del usuario: ${userInput}`
          }]
        }]
      })
    });
    
    console.log('📊 Status HTTP:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error API:', errorData);
      
      // Detailed error information
      const errorMessage = errorData.error?.message || response.statusText;
      const errorDetails = errorData.error?.details || [];
      
      throw new Error(`HTTP Error ${response.status}: ${errorMessage}\nDetalles: ${JSON.stringify(errorDetails)}`);
    }
    
    const data = await response.json();
    console.log('✅ Respuesta API recibida:', data);
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const generatedText = data.candidates[0].content.parts[0].text;
      console.log('📝 Texto generado:', generatedText.substring(0, 100) + '...');
      return generatedText;
    }
    
    throw new Error('Formato de respuesta inválido de la API');
    
  } catch (error) {
    console.error('❌ Error en llamada API:', error);
    throw error;
  }
}

// Simulate AI response for testing purposes
function simulateAIResponse(systemPrompt, userInput) {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Determine response based on system prompt content
      if (systemPrompt.includes('guion') || systemPrompt.includes('TikTok')) {
        resolve(`**GANCHO (Primeros 3 segundos):** "¡Deja de perder dinero en estas 3 cosas estúpidas!"

**CUERPO (3 puntos clave):**
- Punto 1: ${userInput.substring(0, 50)}... (explicación visual con datos concretos)
- Punto 2: La mayoría gasta el 40% más sin darse cuenta (mostrar gráfico)
- Punto 3: Aquí está el truco que nadie te cuenta (demostración en pantalla)

**LLAMADO A LA ACCIÓN (CTA):** Guarda este video y compártelo con ese amigo que siempre está quebrado.

**SUGERENCIA VISUAL:** Primer plano cara seriosa, luego cortes rápidos a ejemplos visuales con texto grande en pantalla.`);
      } else if (systemPrompt.includes('CV') || systemPrompt.includes('ATS')) {
        resolve(`**RESUMEN EJECUTIVO:** Profesional con experiencia destacada en ${userInput.substring(0, 30)}..., especializado en optimización de procesos y resultados medibles.

**PALABRAS CLAVE ATS:** ${userInput.substring(0, 20).split(' ')[0]}, gestión, optimización, análisis, liderazgo, resultados, KPI, estratégico, innovación, eficiencia.

**MEJORAS SUGERIDAS:**
- Añadir métricas cuantificables en cada experiencia
- Usar verbos de acción al inicio de cada viñeta
- Incluir sección de habilidades técnicas con nivel de dominio

**LOGROS CUANTIFICABLES:** "Aumenté eficiencia un 25%" → "Implementé sistema que redujo tiempos un 25%, ahorrando $50k anuales."

**VIÑETAS PROFESIONALES:**
• Lideré equipo de 10 personas, alcanzando 120% de objetivos trimestrales
• Desarrolló estrategia que incrementó conversión 35% en 6 meses
• Optimizó procesos reduciendo costos operativos 20%`);
      } else if (systemPrompt.includes('email') || systemPrompt.includes('ventas')) {
        resolve(`**EMAIL 1: Value-driven + CTA suave**
Asunto: ${userInput.substring(0, 20)}... (solicitud de conexión)

Hola [Nombre],

Noté que ${userInput.substring(0, 40)}... y pensé que podría ser relevante para ti.

He ayudado a empresas similares a lograr [X resultado] en [Y tiempo].

¿Te interesaría conocer más?

Saludos,
[Tu nombre]

**EMAIL 2: Storytelling + prueba social**
Asunto: Cómo [Cliente similar] logró [Resultado]

Hola [Nombre],

Recientemente trabajé con [Empresa] que tenía el mismo desafío que tú.

Implementamos [Solución] y lograron: 
• +40% conversión
• -30% costos
• 2x más leads

¿Te gustaría ver el caso completo?

**EMAIL 3: Objection handling + FAQs**
Asunto: La verdad sobre [Tema común]

Hola [Nombre],

Muchos me preguntan si [Objeción común].

La realidad: [Respuesta honesta con datos].

Aquí están las preguntas más frecuentes:
• ¿Funciona para [Tu industria]? Sí, porque...
• ¿Cuánto tiempo toma? Generalmente [X tiempo]...
• ¿Qué incluye? [Detalles específicos]

¿Tienes alguna otra duda?

**EMAIL 4: Urgency + escasez**
Asunto: Últimas plazas para [Mes/Trimestre]

Hola [Nombre],

Este mes estoy aceptando solo 3 nuevos clientes.

Actualmente tengo 2 reservados, leaving 1 spot disponible.

Si quieres resultados como [Cliente], este es el momento.

¿Te interesa reservar tu lugar?

**EMAIL 5: Break-up email**
Asunto: ¿Seguimos en contacto?

Hola [Nombre],

No he recibido respuesta, así que asumo que ahora no es el momento adecuado.

Entiendo perfectamente -时机 tiene que ser el correcto.

Si algo cambia en el futuro, estaré aquí para ayudarte.

¡Mucho éxito con [Tu proyecto]!`);
      } else {
        resolve(`**Respuesta simulada para:** ${userInput}

Esta es una respuesta de prueba que confirma que:
✅ La función generateContent() funciona correctamente
✅ El sistema de prompts está integrado
✅ El formateo de respuestas opera adecuadamente
✅ El manejo de loading states funciona

**Para usar la API real:**
1. Haz clic en el icono ⚙️ en la esquina superior derecha
2. Ingresa tu API Key de Google AI Studio
3. La función llamará a la API de Gemini real

**Nota:** Esta simulación usa "TEST_MODE" como API Key para pruebas sin consumo.`);
      }
    }, 1500); // Simulate 1.5s delay
  });
}

// Format response with proper line breaks
function formatResponse(text) {
  // Convert markdown-style formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/\n/g, '<br>') // Line breaks
    .replace(/^- (.*)$/gm, '<li>$1</li>') // Bullet points
    .replace(/^(\d+)\. (.*)$/gm, '<strong>$1.</strong> $2'); // Numbered lists
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
    
    // Show feedback
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span class="copy-icon">✅</span> Copiado';
    copyBtn.style.background = 'var(--accent-primary)';
    copyBtn.style.color = 'white';
    copyBtn.style.borderColor = 'var(--accent-primary)';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.background = '';
      copyBtn.style.color = '';
      copyBtn.style.borderColor = '';
    }, 2000);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    alert('Error al copiar al portapapeles');
  }
}

// Paywall Modal initialization
function initPaywallModal() {
  paywallClose.addEventListener('click', hidePaywallModal);
  upgradeBtn.addEventListener('click', () => {
    // Simulate upgrade process
    alert('🎉 ¡Gracias por tu interés en la versión PRO!\n\nEsta es una demo. En producción, aquí iría el proceso de pago real.');
    // For demo purposes, unlock PRO
    localStorage.setItem(PRO_USER_KEY, 'true');
    hidePaywallModal();
    updateUsageDisplay();
    alert('✅ Versión PRO activada (demo) - ¡Generaciones ilimitadas!');
  });
  
  // Reset usage button (for testing purposes)
  resetUsageBtn.addEventListener('click', () => {
    if (confirm('🔄 ¿Resetear contador de uso?\n\nEsto es solo para pruebas. En producción, esta función no estaría disponible.')) {
      localStorage.removeItem(USAGE_STORAGE_KEY);
      localStorage.removeItem(PRO_USER_KEY);
      updateUsageDisplay();
      alert('✅ Contador reseteado - Tienes 3 generaciones gratuitas nuevamente.');
    }
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
  
  const testPrompt = 'Responde con "API funcionando correctamente" si puedes leer esto.';
  const testSystemPrompt = 'Eres un asistente de prueba. Responde brevemente.';
  
  try {
    const result = await callGeminiAPI(testSystemPrompt, testPrompt);
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
    alert('Por favor, ingresa una API Key para probar la conexión.');
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
      
      alert('✅ La API Key funciona correctamente. HTTP 200 OK recibido.');
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
    
    alert(`❌ Error de conexión: ${error.message}\n\nVerifica tu API Key e intenta nuevamente.`);
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
      alert('Por favor, ingresa una API Key válida o activa el modo de prueba.');
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
