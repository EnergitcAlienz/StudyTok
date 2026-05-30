# StudyTok 🌸

App de estudio estilo TikTok con IA integrada.

---

## Cómo subir a Vercel (paso a paso)

### 1. Crear cuenta en GitHub
- Ve a github.com → Sign up
- Crea tu cuenta con tu correo

### 2. Subir el proyecto a GitHub
- En GitHub, clic en **"New repository"**
- Nombre: `studytok`
- Deja todo por defecto → **Create repository**
- GitHub te mostrará comandos. Sigue los de "upload an existing file":
  - Arrastra todos los archivos de esta carpeta al recuadro que aparece
  - Clic en **Commit changes**

### 3. Conectar con Vercel
- Ve a vercel.com → Sign up with GitHub
- Clic en **"Add New Project"**
- Selecciona el repositorio `studytok`
- Clic en **Deploy** (Vercel detecta automáticamente que es Vite)

### 4. Agregar tu API key de Anthropic
- En tu proyecto en Vercel → **Settings** → **Environment Variables**
- Agrega:
  - **Name:** `ANTHROPIC_API_KEY`
  - **Value:** tu clave `sk-ant-...`
- Clic en **Save**
- Ve a **Deployments** → clic en los tres puntos → **Redeploy**

### 5. ¡Listo!
- Vercel te da una URL tipo `studytok-tuusuario.vercel.app`
- Funciona en celular y computadora
- Puedes agregar el ícono a tu pantalla de inicio desde el navegador

---

## Funciones

- 📎 Subir PDFs → extrae texto → genera tarjetas con IA
- 🤖 Asistente de estudio integrado
- 🃏 4 tipos de tarjeta: Concepto, Quiz, Dato, Memoria
- 🔥 Sistema de racha y XP
- 💾 Tarjetas guardadas en el navegador
