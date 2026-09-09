# trend-tracker

Herramientas web de una sola página para @fisiodavidpueyo. Sin dependencias ni build: se abren directamente en el navegador o desde GitHub Pages.

## `index.html` — Ideas de contenido
Genera prompts listos para pegar en Claude y obtener ideas + guiones de Reels de Instagram y vídeos de YouTube.

## `reels.html` — Fábrica de Reels

Genera el prompt para producir un lote entero de reels de una vez, en lugar de ir guión a guión.

- **Grabar por lotes:** 4, 8 o 12 guiones en formato teleprompter (texto limpio, líneas cortas, sin acotaciones dentro) más el plan de rodaje: agrupación por vestuario y localización, orden de grabación, planos de recurso reutilizables y calendario de publicación.
- **Sin cámara:** los mismos guiones adaptados a avatar de IA, voz en off sobre b-roll o solo texto en pantalla. Los reels de historia personal se marcan siempre como "grabar en cámara" y no se adaptan.
- **Reciclar:** pega la transcripción de un vídeo largo, las notas de una consulta o las dudas repetidas por DM y saca varios reels nuevos, cada uno con su hook propio.
- Rota formatos (mito vs realidad, error común, historia personal, dato + pregunta, trending, caso de éxito) y CTAs para no repetir.
- La guía "Cómo montarlo la primera vez" resume el flujo de rodaje por lotes y qué tener en cuenta con los avatares de IA.

## `whatsapp.html` — Envío en cadena por WhatsApp
Pega una lista de números, escribe el mensaje una sola vez y ve enviando contacto por contacto desde tu WhatsApp normal con el texto ya preparado.

- Importa contactos desde un archivo `.csv` (Google Contacts, Outlook, Excel, exportaciones en español) o `.vcf`/vCard (Contactos de Apple y Android): detecta las columnas de nombre y teléfono, prefiere el móvil sobre el fijo y descarta los contactos sin número.
- Detecta nombre y teléfono en formatos variados (`María, 600112233`, `612345678 Javier`, `+34 645 00 11 22`).
- Añade el prefijo del país a los números que no lo lleven y respeta los que ya empiezan por `+` o `00`.
- Elimina duplicados y avisa de las líneas que no ha podido leer.
- Personaliza con `{nombre}` y `{nombrecompleto}`.
- El número emisor es simplemente la sesión de WhatsApp abierta en el dispositivo: la página no vincula ninguna cuenta. El campo "tu número" solo sirve de recordatorio y para excluirte de tu propia lista; se guarda en el navegador, no en el repositorio.
- Abre `wa.me` con el mensaje escrito; el envío final lo confirmas tú (WhatsApp no permite automatizarlo sin arriesgar el bloqueo del número).
- Guarda el progreso en el navegador, permite saltar/deshacer y exportar el registro en CSV.
