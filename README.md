# trend-tracker

Herramientas web de una sola página para @fisiodavidpueyo. Sin dependencias ni build: se abren directamente en el navegador o desde GitHub Pages.

## `index.html` — Ideas de contenido
Genera prompts listos para pegar en Claude y obtener ideas + guiones de Reels de Instagram y vídeos de YouTube.

## `whatsapp.html` — Envío en cadena por WhatsApp
Pega una lista de números, escribe el mensaje una sola vez y ve enviando contacto por contacto desde tu WhatsApp normal con el texto ya preparado.

- Detecta nombre y teléfono en formatos variados (`María, 600112233`, `612345678 Javier`, `+34 645 00 11 22`).
- Añade el prefijo del país a los números que no lo lleven y respeta los que ya empiezan por `+` o `00`.
- Elimina duplicados y avisa de las líneas que no ha podido leer.
- Personaliza con `{nombre}` y `{nombrecompleto}`.
- Abre `wa.me` con el mensaje escrito; el envío final lo confirmas tú (WhatsApp no permite automatizarlo sin arriesgar el bloqueo del número).
- Guarda el progreso en el navegador, permite saltar/deshacer y exportar el registro en CSV.
