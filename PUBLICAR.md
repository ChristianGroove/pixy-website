# Publicar pixy.com.co

El sitio es estático. Coolify publica la rama `main` de este repositorio y Cloudflare va delante (DNS, HTTPS y caché).

## Antes de cada publicación

1. `node tools/build-all.mjs`: regenera páginas, blog, legales, 404, SEO y la versión de CSS y JS. Es estable: si no cambiaste nada, no cambia nada.
2. Revisa en local (`python -m http.server 4300` en esta carpeta): portada, una página de Studio, el blog, un artículo, una página legal; escritorio y 375 px; claro y oscuro; español e inglés.
3. Commit en una rama, PR a `main` y fusión. Coolify despliega al fusionar.

## Una sola vez (primera publicación del sitio renovado)

### Modelos 3D (fuera del repositorio por la licencia de Envato)

Los 8 archivos de `assets/models/` (`agencias.glb`, `edu.glb`, `inmobiliaria.glb`, `pixy.glb`, `resto.glb`, `saas.glb`, `servicios.glb`, `tiendas.glb`, unos 1,4 MB) no están en git. Se suben una vez al servidor y Coolify los monta en el sitio:

1. Copia la carpeta al servidor, por ejemplo a `/data/pixy-website/models` (SFTP o `scp`).
2. En Coolify, en la aplicación del sitio: **Configuration → Persistent Storage → Add** (directorio del servidor):
   - Origen: `/data/pixy-website/models`
   - Destino: la carpeta raíz que sirve nginx en el contenedor más `/assets/models`. Con el paquete estático de Coolify suele ser `/usr/share/nginx/html/assets/models`; confírmalo en la pestaña de configuración del build.
3. Vuelve a desplegar y comprueba que `https://pixy.com.co/assets/models/resto.glb` responde 200.

Si faltan, el sitio funciona igual: el viaje de Spaces y el catálogo se ven sin los objetos en cromo.

### Cloudflare

- **Purga de caché** después de publicar: Caching → Configuration → Purge Everything. Los CSS y JS llevan versión (`?v=`), pero el HTML viejo puede quedar guardado.
- **www**: hoy `www.pixy.com.co` no resuelve. Agrega un registro CNAME `www → pixy.com.co` (con proxy) y una regla de redirección 301 de `www.pixy.com.co/*` a `https://pixy.com.co/${1}`.

### Página 404

`404.html` está en la raíz. Si al abrir una dirección que no existe aparece la página de error de nginx en lugar de la del sitio, en Coolify agrega a la configuración de nginx: `error_page 404 /404.html;`.

### Buscadores y plataformas

- **Google Search Console**: enviar `https://pixy.com.co/sitemap.xml`.
- **Meta, Google y TikTok**: las URL legales no cambian (`/privacy.html`, `/terms.html`, `/data-deletion.html`). No hay que tocar nada.
- **`permissions.html`**: revisar en el panel de apps de Meta si está en una revisión en curso. Si no lo está, se borra (ya está fuera del pie y con `noindex`).

## Después de publicar: comprobaciones

- La portada carga con el fondo de estrellas, el orbe recorre las secciones y el viaje de Spaces muestra los objetos en cromo.
- El blog y un artículo cargan con sus fotos; compartir y copiar enlace funcionan.
- `privacy.html`, `terms.html`, `cookies.html`, `data-deletion.html` y `legal/index.html` muestran la versión 1.0.
- Un formulario de prueba (demo) abre el correo con la constancia al final; envíalo y confirma que llega a contact@pixy.com.co.
- Una URL vieja, por ejemplo `/article-whatsapp-crm.html`, lleva al artículo nuevo.
- La vista previa de un enlace en WhatsApp o LinkedIn muestra la imagen nueva (para forzarlo: https://developers.facebook.com/tools/debug/).
