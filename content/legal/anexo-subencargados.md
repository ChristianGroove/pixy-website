---
titulo: Anexo de subencargados y proveedores tecnológicos
version: 1.0
vigencia: 2026-10-28
estado: Vigente
---

# Anexo de subencargados y proveedores tecnológicos

Este anexo hace parte del [Acuerdo de encargo de tratamiento](04-acuerdo-encargo-tratamiento.md) y de la [Política de tratamiento de datos personales](02-politica-tratamiento-datos.md). Lista los proveedores que pueden procesar datos personales cuando Pixy presta el servicio. Los cambios relevantes se avisan con quince (15) días de anticipación.

## Infraestructura y datos

- **Supabase** (base de datos, autenticación y almacenamiento de archivos). Ubicación: Estados Unidos (región AWS us-west-2, Oregón). Procesa todos los datos de la Plataforma.
- **Hostinger** (servidor privado virtual donde corre la aplicación, administrado con Coolify). Centro de datos fuera de Colombia. Procesa todos los datos en tránsito, las colas de trabajo y el servicio de voz.
- **Cloudflare** (red de entrega, protección contra ataques, verificación anti-robots Turnstile). Estados Unidos y red global. Procesa direcciones IP, datos técnicos de las visitas y el tráfico cifrado.
- **Inngest** (ejecución de tareas programadas y automatizaciones, versión en la nube). Estados Unidos. Procesa identificadores y datos de las tareas.

## Inteligencia artificial

- **Anthropic** (modelos Claude): respuestas de la bandeja, clasificación de conversaciones y otras tareas de IA. Estados Unidos. Procesa el texto de los mensajes, el contexto y el Conocimiento del Cliente necesarios para cada tarea.
- **Google** (modelos Gemini): tareas de IA de respaldo, transcripción de notas de voz, comprensión de imágenes y generación de imágenes. Estados Unidos y red global. Procesa texto, audio e imágenes de la tarea.
- **OpenAI**: representaciones vectoriales (*embeddings*) del Conocimiento para búsquedas y algunas funciones heredadas. Estados Unidos. Procesa el texto del Conocimiento y de las consultas.
- **Groq**: proveedor de respaldo para algunas tareas de texto cuando los anteriores no están disponibles. Estados Unidos. Procesa el texto de la tarea.
- **Proveedores que elige el Cliente**: si el Cliente conecta su propia llave de un proveedor de IA (por ejemplo, Mistral, xAI, DeepSeek o Qwen), los datos de esas tareas van a ese proveedor según el contrato del Cliente con él y bajo su responsabilidad. Pixy no usa con sus propias llaves proveedores con servidores en países sin nivel adecuado de protección.

## Comunicaciones

- **Meta Platforms** (WhatsApp Cloud API, Instagram, Messenger, Facebook): envío y recepción de mensajes, comentarios y llamadas de los canales que el Cliente conecta. Estados Unidos y red global. En la API de WhatsApp, Meta actúa como proveedor del Cliente según los términos que el Cliente acepta con Meta.
- **Resend** (correo transaccional y campañas de la Plataforma). Estados Unidos. Procesa direcciones, contenido y eventos de entrega de los correos.
- **Servidor SMTP del Cliente**, cuando el Cliente configura su propio correo. Lo elige y contrata el Cliente.
- **Twilio** (SMS), cuando el Cliente usa automatizaciones con SMS. Estados Unidos. Procesa números de teléfono y contenido del mensaje.
- **TikTok** (formularios de clientes potenciales y API de negocios), cuando el Cliente conecta su cuenta. Según los términos de TikTok con el Cliente.
- **Google** (Calendario), cuando un Usuario conecta su calendario. Según la sección de datos de Google de la Política de tratamiento.

## Pagos

- **Wompi** (Bancolombia) y **Stripe**, para los pagos de la suscripción a Pixy y para los pagos que reciben los Clientes en sus Sitios generados con su propia cuenta. Colombia y Estados Unidos. Procesan datos de la transacción y del pagador; los datos de tarjeta los recibe directamente la pasarela.

## Mapas

- **OpenStreetMap (Nominatim) y Carto**, para buscar direcciones y mostrar mapas (sedes, geocercas, inmuebles). Unión Europea y Estados Unidos. Reciben la dirección buscada y la dirección IP de quien ve el mapa.

## Servicios que contrata el Cliente

Cuando el Cliente conecta sus propios servicios (por ejemplo, su servidor de correo, su almacenamiento compatible con S3 o sus cuentas de pago), esos proveedores actúan por cuenta del Cliente y según el contrato del Cliente con ellos.
