# Micro-Herramientas impulsadas por IA

Dashboard SaaS responsive con herramientas de IA impulsadas por Google Gemini para creadores de contenido, buscadores de empleo y negocios.

## 🚀 Características

- **9 Herramientas de IA** especializadas en 3 categorías
- **Integración con Google Gemini API** (gemini-1.5-flash)
- **Sistema Paywall** con límite diario gratuito (3 generaciones/día)
- **Diseño responsive** y moderno con tema claro/oscuro
- **Sin dependencias** - HTML5, CSS3, JavaScript vanilla

## 📁 Estructura del Proyecto

```
Micro-Herramientas-impulsadas-por-IA/
├── index.html          # Estructura principal
├── css/
│   └── styles.css      # Estilos responsive
├── js/
│   ├── app.js          # Lógica de la aplicación
│   └── prompts.js      # System prompts + schemas JSON
└── assets/
    ├── guides/         # Guías de uso
    ├── infographics/   # Diagramas
    ├── subtitles/      # Subtítulos VTT
    └── videos/         # Video demo (opcional)
```

## 🛠️ Herramientas Disponibles

### 🎬 Creadores de Contenido
- **Generador de Guiones**: Guiones virales para TikTok, Reels y Shorts
- **Generador de Hooks**: Ganchos irresistibles para captar atención
- **Generador de Captions**: Captions engaging para redes sociales

### 💼 Buscadores de Empleo
- **Optimizador de CV**: Mejora tu CV para sistemas ATS
- **Carta de Presentación**: Cartas personalizadas por vacante
- **Preparación de Entrevista**: Preguntas y respuestas estratégicas

### 📈 Negocios y Ventas
- **Emails de Ventas**: Correos B2B fríos efectivos
- **Pitch Deck**: Estructura para presentaciones de inversión
- **Propuesta de Valor**: Framework de valor para negocios

## ⚙️ Configuración

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/estudio123455-hue/Micro-Herramientas-impulsadas-por-IA.git
   cd Micro-Herramientas-impulsadas-por-IA
   ```

2. **Obtén tu API Key** de [Google AI Studio](https://aistudio.google.com/apikey)

3. **Configura la API Key**:
   - Usa el botón ⚙️ en la interfaz, o
   - Activa el **modo de prueba** para probar sin consumir cuota

4. **Inicia un servidor local**:
   ```bash
   # Python 3
   python3 -m http.server 5000
   
   # Node.js
   npx serve .
   ```

5. **Abre tu navegador** en `http://localhost:5000`

## 💰 Modelo Freemium

- **Gratuito**: 3 generaciones por día
- **PRO ($9.99/mes)**: Generaciones ilimitadas y acceso premium

## 🎨 Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Variables, Flexbox, Grid, Animaciones
- **JavaScript ES6+**: async/await, fetch, localStorage
- **Google Gemini API**: gemini-1.5-flash

## 📝 Sistema de Prompts

Cada herramienta utiliza system prompts especializados:
- `guionViral`: Guiones estructurados para redes sociales
- `optimizadorCV`: Optimización para ATS y reclutamiento
- `emailVentas`: Correos B2B fríos efectivos

## 🔧 Desarrollo

El proyecto está diseñado para ser:
- **Sin dependencias**: Todo código nativo
- **Responsive**: Mobile-first approach
- **Accesible**: HTML semántico
- **Modular**: Código organizado por funcionalidad

## 📄 Licencia

Este proyecto es de código abierto. Contribuciones son bienvenidas.

## 🤝 Contribuciones

Para contribuir:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o soporte, abre un issue en el repositorio.

---

**Desarrollado con ❤️ usando HTML, CSS y JavaScript vanilla**
