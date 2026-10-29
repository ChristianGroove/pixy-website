# Blog de Pixy: cómo alimentarlo

Regla para cualquier intervención futura (personas o agentes). El blog se escribe en Markdown y se publica con un solo comando: nadie edita a mano `blog.html` ni `blog/*.html`, porque se regeneran.

## 1. Publicar un artículo

1. Crea `content/blog/<slug>.md`. El slug va en minúsculas, sin tildes y con guiones; es la URL (`/blog/<slug>.html`) y no se cambia después de publicar.
2. Pon la portada en `tools/blog/covers-raw/<slug>.png` (ver sección 4). Esa carpeta no se sube al repositorio: el generador publica `assets/blog/<slug>.webp` (página) y `assets/blog/<slug>-og.jpg` (redes).
3. Corre `node tools/build-all.mjs`.
4. Revisa el artículo en local (escritorio y 375 px, claro y oscuro) y haz commit de `content/`, `blog/`, `blog.html`, `assets/blog/`, `sitemap.xml` y `locales/`.

## 2. Formato

```markdown
---
title: Título de 40 a 65 caracteres, con la idea principal al inicio
description: Resumen de 120 a 160 caracteres. Es lo que se ve en Google y al compartir.
date: AAAA-MM-DD
updated: AAAA-MM-DD            # opcional; si se edita un artículo publicado
category: atencion             # atencion | ventas | cobros | operacion | resto | inmobiliaria | tiendas | agencias
featured: true                 # opcional; solo uno a la vez, va primero en el índice
keywords: palabra clave principal, variante, variante
cta: features.html             # página a la que lleva «Conoce la plataforma»
faq:
  - q: Pregunta real que haría un cliente
    a: Respuesta corta y verdadera.
---

Primer párrafo: el problema del lector en dos o tres frases. Sale como entrada destacada.

## Subtítulo
Texto con **negrita**, *cursiva*, listas (- o 1.), citas (>) y [enlaces](/spaces.html).
```

- Enlaces internos con ruta desde la raíz (`/contact.html`, `/blog/otro-articulo.html`). Cada artículo enlaza al menos a otro artículo, a la página de su Space y a `/contact.html`.
- Las preguntas frecuentes se muestran al final y generan datos estructurados FAQPage.
- Temas nuevos: se agregan en `CATEGORIES` de `tools/blog/build-blog.mjs`, con su nombre en español e inglés y un acento de la paleta de los Spaces.

## 3. Reglas editoriales (no negociables)

- **Solo lo que existe.** Cada función mencionada debe figurar como «Disponible» en `docs/comercial/` de la plataforma. Lo que está «Llegando» se dice como «está en camino», nunca como función actual. Lo que «no prometemos todavía» va en una sección con ese nombre si el tema lo toca.
- **Sin cifras ni casos inventados.** Nada de «el 85 % de los clientes», «40 % más de conversión» ni clientes ficticios. Si se usa una cifra, viene de una fuente citada o de datos reales de Pixy aprobados por el dueño.
- **Sin nombres de competidores.** Se compara contra categorías («un CRM genérico», «un chatbot»).
- **Global.** Ejemplos que sirvan en cualquier país; nada de ciudades ni normas de un país, salvo que el tema lo exija.
- **Vocabulario.** Nunca «en un solo lugar» ni «Pixy Agency» (es Pixy Studio). Tú, frases cortas, sin emojis. Autor: «Equipo Pixy».
- **Idioma.** Los artículos van en español; en inglés la página muestra la interfaz traducida y avisa que el artículo está en español.

## 4. Portadas

Fotografía editorial realista, sin pantallas legibles, sin logos y sin cifras. Se generan con IA (Figma, modelo gemini-3.1-flash-image, 16:9) con esta base, cambiando solo la escena:

> Photorealistic editorial photograph. [ESCENA: quién, dónde, qué hace, relacionado con el tema]. Dark moody tones, warm practical light, one subtle [magenta / acento del tema] accent light, shallow depth of field, cinematic 35mm look, natural skin tones. No readable text, no logos, no visible app interface.

Personas diversas y reales, escenas de trabajo cotidiano. Se descarta cualquier imagen con texto, interfaces inventadas o marcas.

## 5. SEO que el generador ya resuelve

Título y descripción, canonical, Open Graph y Twitter con imagen 1200×630, datos estructurados (BlogPosting, BreadcrumbList y FAQPage), sitemap, feed RSS (`/blog/feed.xml`), tiempo de lectura, enlaces para compartir y artículos relacionados. Lo que depende de quien escribe: una intención de búsqueda por artículo (la palabra clave en el título, la descripción, el primer párrafo y un subtítulo), subtítulos que respondan preguntas y enlaces internos.

## 6. Retirar o fusionar un artículo

No se borra una URL publicada sin redirigirla: borra el `.md`, agrega el slug viejo a `OLD` en `tools/blog/build-blog.mjs` con su reemplazo (o `null` para mandarlo al blog) y regenera. El generador escribe la redirección.

## 7. Ritmo sugerido

Un artículo cada dos semanas, alternando temas del núcleo (atención, ventas, cobros, operación) con un Space. Cada novedad de `docs/comercial/novedades.md` que cambie lo que se vende es candidata a artículo.
