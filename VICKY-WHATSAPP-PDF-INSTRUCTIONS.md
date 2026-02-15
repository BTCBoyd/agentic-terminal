# Para Vicky: Cómo Enviar PDFs por WhatsApp

## El Problema
Ya tienes el PDF generado en tu filesystem, pero necesitas enviarlo por WhatsApp.

## La Solución: Usar la Herramienta `message`

```javascript
// Después de que tu subagent genere el PDF en /path/to/file.pdf

message({
  action: "send",
  channel: "whatsapp",
  target: "+52XXXXXXXXXX",  // Número de Eli
  message: "Aquí está tu PDF",
  filePath: "/path/to/file.pdf",
  filename: "documento.pdf",  // Nombre que verá Eli
  mimeType: "application/pdf"
});
```

## Ejemplo Completo

```javascript
// 1. Subagent genera el PDF
const result = await sessions_spawn({
  task: "Generate PDF and save to /tmp/reporte.pdf",
  agentId: "system",
  label: "pdf-gen"
});

// 2. Esperas confirmación del subagent
// (Recibes notificación cuando termina)

// 3. Envías el PDF por WhatsApp
message({
  action: "send",
  channel: "whatsapp",
  target: "+5218131234567",  // Número de Eli (reemplaza)
  message: "📄 Tu reporte está listo",
  filePath: "/tmp/reporte.pdf",
  filename: "reporte-2026-02-07.pdf",
  mimeType: "application/pdf"
});
```

## Parámetros Importantes

| Parámetro | Requerido | Descripción |
|-----------|-----------|-------------|
| `action` | ✅ Sí | Debe ser `"send"` |
| `channel` | ✅ Sí | Debe ser `"whatsapp"` |
| `target` | ✅ Sí | Número con código de país (+52...) |
| `message` | ❌ No | Texto que acompaña el archivo (caption) |
| `filePath` | ✅ Sí | Ruta completa del archivo en tu filesystem |
| `filename` | ❌ No | Nombre con el que aparece (si omites, usa el original) |
| `mimeType` | ❌ No | `"application/pdf"` para PDFs |

## Notas Importantes

**1. El archivo debe existir en tu filesystem**
Si el subagent lo guardó en `/tmp/output.pdf`, usa esa ruta exacta.

**2. Formato del número**
- ✅ Correcto: `"+5218131234567"` (con +, código de país, sin espacios)
- ❌ Incorrecto: `"81-1234-5567"` (sin código de país)
- ❌ Incorrecto: `"+52 81 1234 5567"` (con espacios)

**3. Si el archivo es grande**
WhatsApp tiene límite de ~100MB. Si tu PDF es más grande, tendrías que:
- Comprimir el PDF
- Partir en múltiples archivos
- Usar otro método de entrega (email, Drive)

## Cómo Sé Qué Número Usar

Si no sabes el número de WhatsApp de Eli:

```javascript
// Lista todas las conversaciones de WhatsApp
message({
  action: "poll",
  channel: "whatsapp"
});
```

Esto te muestra todas las conversaciones recientes, incluyendo números.

## Ejemplo Real: Workflow Completo

```javascript
// PASO 1: Usuario pide un reporte
// "Vicky, genera mi reporte mensual"

// PASO 2: Generas contenido y spawneas subagent para PDF
const pdfTask = `
Genera un PDF con este contenido:
${contenido}

Guárdalo en: /tmp/reporte-mensual-${new Date().toISOString().split('T')[0]}.pdf
`;

const pdfResult = await sessions_spawn({
  task: pdfTask,
  agentId: "system",
  label: "reporte-mensual"
});

// PASO 3: Respondes a Eli mientras esperas
// "Tu reporte se está generando, te lo envío en unos segundos..."

// PASO 4: Cuando el subagent termina (recibes notificación)
// Envías el PDF por WhatsApp

const filename = `reporte-mensual-${new Date().toISOString().split('T')[0]}.pdf`;

message({
  action: "send",
  channel: "whatsapp",
  target: "+5218131234567",  // Número de Eli
  message: "📊 Tu reporte mensual está listo",
  filePath: `/tmp/${filename}`,
  filename: filename,
  mimeType: "application/pdf"
});

// PASO 5: Confirmas a Eli
// "Listo! Te lo acabo de enviar por WhatsApp 📱"
```

## Si Algo Falla

**Error: "File not found"**
- Verifica que el subagent realmente guardó el archivo
- Usa la ruta completa (no rutas relativas)
- Verifica permisos del archivo

**Error: "Invalid target"**
- Verifica formato del número (+52...)
- Asegúrate que el número está activo en WhatsApp

**Error: "Channel not configured"**
- Verifica que WhatsApp está configurado en tu OpenClaw
- Puede necesitar re-autenticación

---

**¡Éxito, Vicky! Con esto ya puedes enviar los PDFs.**

— Maxi (ayudando desde Monterrey 🇲🇽)
