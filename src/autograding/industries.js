// The copy of every inphox Autograding industry page, in English and Spanish (its own chunk: only these pages load it).
// Every capability named here is in the published API docs (autograding.inphox.net/api/docs): cosmetic grading only,
// photos in, a 0-100 score, an A-D grade and findings per side; grading standards (profiles) with versions; View as;
// compare across accounts through a share link; external_id and metadata; batches and CSV export; webhooks;
// idempotency; drafts and retakes; the battery swelling check; prepaid credits. Anything else is a question for a
// pilot, and is worded as one. Examples are marked as examples. Founder rules (2026-11-27): "7–8 seconds", "high
// accuracy" on scratches, never "every" flaw, never "millions"; no Spanish-language support is promised.
// cta.to: start (sign up in the app), contact, docs, developers (API keys), pricing, example (#example on the page).

export const INDUSTRIES = {
  buyback: {
    example: 'compare',
    en: {
      kicker: 'Autograding for buyback and trade-in',
      h1: ['Know the visible condition', 'before the device reaches your desk.'],
      intro: 'A seller’s description and your receiving team’s inspection do not always describe the same device. inphox autograde grades the cosmetic condition from photos, on your own grading standard, so you can see the scratches, chips and dents before the box is opened.',
      cta: { primary: { label: 'Grade a device', to: 'start' }, secondary: { label: 'Discuss a buyback integration', to: 'contact' } },
      flow: { k: 'Where it fits', h: 'A photo record between the quote and the receiving bench.', steps: [
        ['Seller or staff take photos', 'Front, back and edges, with a phone. One photo per side, cropped to the device.'],
        ['A grade in about 7–8 seconds', 'A 0-100 score, an A to D grade and the findings on each side.'],
        ['Your standard decides the grade', 'Your points per scratch, dent and crack, your grade cut-offs.'],
        ['Receiving compares', 'The device in hand is checked against the photo record, side by side.']
      ] },
      sections: [
        { k: '01', h: 'Where the differences begin', p: 'Trade-in forms ask sellers to pick a word: excellent, good, fair. Two people read those words differently, and the difference only shows up after shipping, at the receiving bench. A photo grade does not make that gap disappear. It gives both sides the same evidence to look at.' },
        { k: '02', h: 'Evidence, not an adjective', p: 'Each photo is graded side by side. The result names what was seen on every side and how severe it is (scratches, scuffs, dents, cracks, chips, discoloration, structural damage), with a score and a grade for the side and for the device. The device takes its worst side.', list: ['Front A 93: light scratches on the glass', 'Back B 84: noticeable wear on the housing', 'Device: B, 84, worst side back'] },
        { k: '03', h: 'Your grading standard, not ours', p: 'Start from the inphox Standard (A from 90, B from 80, C from 70) or duplicate it and set your own points per condition, the most a cracked back can score, and where each grade starts. Every save is a new version, and every grade names the version that made it, so a quote from March still reads the same in June.' },
        { k: '04', h: 'Before shipping, or at intake', p: 'Today the grade is made in the inphox autograde app or through the API, by your staff or anyone you give access. A seller-facing step inside your own trade-in flow is an integration you build on the API: your form collects the photos, sends them, and shows your quote. We can help you plan it; we do not yet ship a ready-made seller widget.' },
        { k: '05', h: 'When the grades differ', p: 'Photos can miss what only hands find: a swollen battery, a bent frame, a screen lifting. Those are reported by a person, and until the battery question is answered the grade is marked provisional. When receiving disagrees, both records are there to compare, with the photos and the reasons.' }
      ],
      example: { k: 'Example', h: 'One trade-in, three records.', note: 'Illustrative example. The photo grade is the documented example result from our API docs; the seller and receiving columns show where your own process fits.',
        cols: [
          ['Seller declared', 'Good', 'A word chosen from a list in the trade-in form.'],
          ['Photo grade', 'B · 84', 'Front A 93: light scratches on the glass. Back B 84: noticeable wear on the housing.'],
          ['Receiving check', 'Your team', 'Checks the device in hand against the photo record and answers the battery question.']
        ] },
      fit: { k: 'Boundaries', h: 'What the photo grade is, and what it is not.',
        does: ['Grades visible cosmetic condition from photos of phones, tablets, laptops and smartwatches.', 'Keeps the photos, findings and standard version behind every grade.', 'Lets a person report what photos cannot show.'],
        doesnt: ['It is not a final quote or a promise that receiving will agree.', 'No functional tests, IMEI, carrier or blacklist checks.', 'It does not value the device: your pricing stays yours.'] },
      evaluate: { k: 'Evaluate', h: 'Test it on devices you have already graded.', steps: ['Pick 20 to 50 devices your team graded recently, across your grades.', 'Photograph them as a seller would, and grade them on a copy of your standard.', 'Compare the photo grades with your team’s, device by device, and decide whether the difference matters to your offers.'] },
      faq: [
        { q: 'Can sellers grade their own device before shipping?', a: 'Through the API, yes: your trade-in flow collects the photos and sends them. There is no ready-made seller page yet; talk to us if you want to plan that integration.' },
        { q: 'Will this reduce requotes?', a: 'We have not measured that for any buyback business yet. That is the question a pilot on your own devices answers.' },
        { q: 'Does the grade include functional checks?', a: 'No. inphox autograde grades cosmetic condition only. Diagnostics and erasure are separate tools.' }
      ],
      close: { h: 'Grade one of your trade-ins now.', p: 'Sign up, photograph a device and see the grade, the findings and the standard behind it.' }
    },
    es: {
      kicker: 'Autograding para recompra y canje',
      h1: ['Conoce el estado estético del dispositivo', 'antes de recibirlo.'],
      intro: 'La descripción del vendedor y la inspección de tu equipo de recepción no siempre describen el mismo dispositivo. inphox autograde califica el estado estético a partir de fotos, con tu propio estándar, para que veas rayones, despostilladuras y abolladuras antes de abrir la caja.',
      cta: { primary: { label: 'Califica un dispositivo', to: 'start' }, secondary: { label: 'Habla de una integración de recompra', to: 'contact' } },
      flow: { k: 'Dónde encaja', h: 'Un registro con fotos entre la cotización y la mesa de recepción.', steps: [
        ['El vendedor o tu personal toma fotos', 'Frente, reverso y bordes, con un teléfono. Una foto por lado, recortada al dispositivo.'],
        ['Una calificación en 7–8 segundos', 'Una puntuación de 0 a 100, una calificación de la A a la D y los hallazgos de cada lado.'],
        ['Tu estándar decide la calificación', 'Tus puntos por rayón, abolladura y grieta, y tus límites entre calificaciones.'],
        ['Recepción compara', 'El dispositivo en mano se revisa contra el registro con fotos, lado por lado.']
      ] },
      sections: [
        { k: '01', h: 'Dónde empiezan las diferencias', p: 'Los formularios de canje piden al vendedor elegir una palabra: excelente, bueno, regular. Dos personas leen esas palabras de forma distinta, y la diferencia solo aparece después del envío, en recepción. Una calificación con fotos no elimina esa brecha. Da a ambas partes la misma evidencia para revisar.' },
        { k: '02', h: 'Evidencia, no un adjetivo', p: 'Cada foto se califica por lado. El resultado nombra lo que se vio en cada lado y su severidad (rayones, roces, abolladuras, grietas, despostilladuras, decoloración, daño estructural), con una puntuación y una calificación por lado y para el dispositivo. El dispositivo toma su peor lado.', list: ['Frente A 93: rayones leves en el vidrio', 'Reverso B 84: desgaste notable en la carcasa', 'Dispositivo: B, 84, peor lado el reverso'] },
        { k: '03', h: 'Tu estándar de calificación, no el nuestro', p: 'Parte del inphox Standard (A desde 90, B desde 80, C desde 70) o duplícalo y define tus puntos por condición, la puntuación máxima de un reverso roto y dónde empieza cada calificación. Cada cambio crea una versión nueva y cada calificación nombra la versión que la produjo, así que una cotización de marzo se lee igual en junio.' },
        { k: '04', h: 'Antes del envío o en la recepción', p: 'Hoy la calificación se hace en la app de inphox autograde o con la API, por tu personal o por quien tenga acceso. Un paso para el vendedor dentro de tu propio flujo de canje es una integración que construyes con la API: tu formulario recoge las fotos, las envía y muestra tu cotización. Podemos ayudarte a planearla; todavía no ofrecemos un widget listo para vendedores.' },
        { k: '05', h: 'Cuando las calificaciones no coinciden', p: 'Las fotos pueden no mostrar lo que solo se detecta en mano: una batería inflada, un marco doblado, una pantalla que se levanta. Eso lo reporta una persona, y mientras la pregunta de la batería no tenga respuesta, la calificación queda como provisional. Si recepción no está de acuerdo, ambos registros están ahí para comparar, con las fotos y los motivos.' }
      ],
      example: { k: 'Ejemplo', h: 'Un canje, tres registros.', note: 'Ejemplo ilustrativo. La calificación por fotos es el resultado de ejemplo documentado en nuestra API; las columnas del vendedor y de recepción muestran dónde encaja tu proceso.',
        cols: [
          ['Declaración del vendedor', 'Bueno', 'Una palabra elegida de una lista en el formulario de canje.'],
          ['Calificación por fotos', 'B · 84', 'Frente A 93: rayones leves en el vidrio. Reverso B 84: desgaste notable en la carcasa.'],
          ['Revisión en recepción', 'Tu equipo', 'Revisa el dispositivo en mano contra el registro y responde la pregunta de la batería.']
        ] },
      fit: { k: 'Alcance', h: 'Qué es la calificación por fotos y qué no es.',
        does: ['Califica el estado estético visible a partir de fotos de teléfonos, tabletas, laptops y relojes.', 'Guarda las fotos, los hallazgos y la versión del estándar detrás de cada calificación.', 'Permite que una persona reporte lo que las fotos no muestran.'],
        doesnt: ['No es una cotización final ni promete que recepción estará de acuerdo.', 'No hace pruebas funcionales ni revisiones de IMEI, operador o lista negra.', 'No valúa el dispositivo: tus precios siguen siendo tuyos.'] },
      evaluate: { k: 'Evaluación', h: 'Pruébalo con dispositivos que ya calificaste.', steps: ['Elige de 20 a 50 dispositivos que tu equipo calificó hace poco, de todas tus calificaciones.', 'Fotografíalos como lo haría un vendedor y califícalos con una copia de tu estándar.', 'Compara, dispositivo por dispositivo, las calificaciones por fotos con las de tu equipo y decide si la diferencia importa para tus ofertas.'] },
      faq: [
        { q: '¿Los vendedores pueden calificar su propio dispositivo antes de enviarlo?', a: 'Con la API, sí: tu flujo de canje recoge las fotos y las envía. Todavía no hay una página lista para vendedores; escríbenos si quieres planear esa integración.' },
        { q: '¿Esto reduce las recotizaciones?', a: 'Aún no lo hemos medido en ningún negocio de recompra. Esa es la pregunta que responde una prueba con tus propios dispositivos.' },
        { q: '¿La calificación incluye pruebas funcionales?', a: 'No. inphox autograde califica solo el estado estético. El diagnóstico y el borrado son herramientas aparte.' }
      ],
      close: { h: 'Califica uno de tus canjes ahora.', p: 'Regístrate, fotografía un dispositivo y ve la calificación, los hallazgos y el estándar que la respalda.' }
    }
  },

  itad: {
    example: 'batch',
    en: {
      kicker: 'Autograding for ITAD and asset recovery',
      h1: ['Add cosmetic grading to your ITAD workflow,', 'not another system to replace it.'],
      intro: 'Devices arrive from many clients and pass through many hands. inphox autograde adds a documented cosmetic grade to each one from photos, carries your asset ID on the result, and hands it to the systems you already run. It does not erase data, run diagnostics or certify disposition.',
      cta: { primary: { label: 'Evaluate with your grading standard', to: 'contact' }, secondary: { label: 'Explore the API', to: 'docs' } },
      flow: { k: 'Where it fits', h: 'One step in your process, with your IDs on both sides.', steps: [
        ['Intake', 'Your system creates the asset record and its ID, as today.'],
        ['Photos and grade', 'Photos per side, graded on your standard, with your asset ID as the external_id.'],
        ['Results back', 'A webhook says a device or a batch is done; your system fetches the grade, or exports CSV.'],
        ['Exceptions to people', 'Refused photos, provisional grades and disagreements go to a person to review.']
      ] },
      sections: [
        { k: '01', h: 'Consistency across operators and sites', p: 'Two graders reading the same scuff, or one grader on Monday and Friday, can land on different grades. The inspection step in inphox autograde is the same for every device and every account: it finds which conditions are on each side and how severe. Your standard then turns that into points and a grade, the same way every time.' },
        { k: '02', h: 'A record you can audit', p: 'Each grade keeps the photos (unless you turn retention off), the findings for every side, the score, and the exact standard and version that made it. An inspection version tells you when we changed how photos are inspected. Account changes (keys, webhooks, share links, data settings) are in an audit log.' },
        { k: '03', h: 'Your asset IDs, your fields', p: 'Send your asset or lot ID as external_id, and serial, IMEI, SKU or a client reference as metadata. They come back exactly as sent and never change the grade. A configuration can make your own label fields required for every device, so a missing asset tag is refused at the door.', list: ['external_id: LOT52-ITEM392', 'metadata: serial, imei, sku, customer_ref', 'labels per photo, checked against your fields'] },
        { k: '04', h: 'Volume without new screens', p: 'Send a whole lot as one batch through the API, or drop folders of photos on the Upload page (a folder per device, or files named like LOT52-392_front.jpg). Follow progress per batch, then export results as CSV or JSON. Every account is served in turn, so one large batch never holds up anyone else.' },
        { k: '05', h: 'Exceptions stay with people', p: 'Photos that cannot be judged (blurry, too dark, cut off) are refused with a reason, and a refused device is never charged. Swollen batteries, bent frames and lifting screens are reported by the operator; until the battery question is answered the grade is marked provisional and needs review.' }
      ],
      example: { k: 'Example', h: 'A batch, with your IDs on every row.', note: 'Illustrative example of a batch export. The columns are the fields the API returns; the rows are not customer data.',
        head: ['external_id', 'Device', 'Grade', 'Score', 'Status'],
        rows: [
          ['LOT52-ITEM390', 'iPhone 13', 'A', '92', 'completed'],
          ['LOT52-ITEM391', 'iPad (9th gen)', 'C', '73', 'completed'],
          ['LOT52-ITEM392', 'iPhone 13', 'B', '84', 'needs review: battery not checked'],
          ['LOT52-ITEM393', 'Galaxy S21', '–', '–', 'photo refused: back too dark']
        ] },
      fit: { k: 'Boundaries', h: 'Cosmetic grading is one step, not the whole disposition.',
        does: ['Grades visible cosmetic condition of phones, tablets, laptops and smartwatches.', 'Returns your references with each result, through the API, webhooks and CSV.', 'Applies your grading standard and records which version graded each device.'],
        doesnt: ['No data sanitization or erasure certificates.', 'No functional diagnostics, IMEI or blacklist checks.', 'No asset valuation, chain-of-custody or compliance certification.'] },
      evaluate: { k: 'Evaluate', h: 'A side-by-side calibration on your own inventory.', steps: ['Share your grading standard with us, or build it yourself as a copy of the inphox Standard.', 'Grade a sample of devices your team has already graded, with their asset IDs as external_id.', 'Export both sets and compare grade variation, photo time per device and the exceptions people still had to handle.'] },
      faq: [
        { q: 'Does this replace our ITAD platform?', a: 'No. It adds a cosmetic grade to the records you already keep, through the API, webhooks or CSV export.' },
        { q: 'Can we keep photos out of storage?', a: 'Zero data retention, where photos are deleted as soon as each device is graded, is an account setting that is being rolled out. Check the data section of the API docs for its current availability.' },
        { q: 'What does a pilot measure?', a: 'Grade variation against your graders, capture time per device, operator workload and rework. We do not promise a result before it is measured on your devices.' }
      ],
      close: { h: 'Bring a sample of your inventory.', p: 'Tell us your grading standard and volume, and we will set up a side-by-side evaluation.' }
    },
    es: {
      kicker: 'Autograding para ITAD y recuperación de activos',
      h1: ['Incorpora la evaluación estética a tu proceso de gestión de activos,', 'sin reemplazar tus sistemas.'],
      intro: 'Los dispositivos llegan de muchos clientes y pasan por muchas manos. inphox autograde suma a cada uno una calificación estética documentada a partir de fotos, lleva tu ID de activo en el resultado y lo entrega a los sistemas que ya usas. No borra datos, no hace diagnósticos ni certifica la disposición final.',
      cta: { primary: { label: 'Evalúalo con tu estándar', to: 'contact' }, secondary: { label: 'Explora la API', to: 'docs' } },
      flow: { k: 'Dónde encaja', h: 'Un paso de tu proceso, con tus ID de principio a fin.', steps: [
        ['Recepción', 'Tu sistema crea el registro del activo y su ID, como hoy.'],
        ['Fotos y calificación', 'Fotos por lado, calificadas con tu estándar, con tu ID de activo como external_id.'],
        ['Resultados de vuelta', 'Un webhook avisa que un dispositivo o un lote terminó; tu sistema obtiene la calificación o exporta un CSV.'],
        ['Excepciones a personas', 'Fotos rechazadas, calificaciones provisionales y desacuerdos pasan a revisión humana.']
      ] },
      sections: [
        { k: '01', h: 'Consistencia entre operadores y sedes', p: 'Dos evaluadores ante el mismo roce, o el mismo evaluador un lunes y un viernes, pueden llegar a calificaciones distintas. La inspección de inphox autograde es igual para cada dispositivo y cada cuenta: encuentra qué condiciones hay en cada lado y su severidad. Después tu estándar las convierte en puntos y una calificación, siempre de la misma forma.' },
        { k: '02', h: 'Un registro auditable', p: 'Cada calificación guarda las fotos (salvo que desactives la retención), los hallazgos de cada lado, la puntuación y el estándar y la versión exactos que la produjeron. Una versión de inspección indica cuándo cambiamos la forma de inspeccionar las fotos. Los cambios de la cuenta (claves, webhooks, enlaces compartidos, ajustes de datos) quedan en un registro de auditoría.' },
        { k: '03', h: 'Tus ID de activo, tus campos', p: 'Envía tu ID de activo o de lote como external_id, y el número de serie, IMEI, SKU o una referencia del cliente como metadata. Regresan tal como los enviaste y nunca cambian la calificación. Una configuración puede volver obligatorios tus propios campos de etiqueta, así un dispositivo sin etiqueta de activo se rechaza de entrada.', list: ['external_id: LOT52-ITEM392', 'metadata: serial, imei, sku, customer_ref', 'etiquetas por foto, revisadas contra tus campos'] },
        { k: '04', h: 'Volumen sin pantallas nuevas', p: 'Envía un lote completo como un solo batch por la API, o arrastra carpetas de fotos a la página Upload (una carpeta por dispositivo, o archivos como LOT52-392_front.jpg). Sigue el avance de cada lote y exporta los resultados en CSV o JSON. Las cuentas se atienden por turnos, así que un lote grande nunca detiene a nadie más.' },
        { k: '05', h: 'Las excepciones quedan en manos de personas', p: 'Las fotos que no se pueden juzgar (borrosas, oscuras, cortadas) se rechazan con un motivo, y un dispositivo rechazado nunca se cobra. Baterías infladas, marcos doblados y pantallas que se levantan los reporta el operador; mientras la pregunta de la batería no tenga respuesta, la calificación queda provisional y requiere revisión.' }
      ],
      example: { k: 'Ejemplo', h: 'Un lote, con tus ID en cada fila.', note: 'Ejemplo ilustrativo de una exportación de lote. Las columnas son los campos que devuelve la API; las filas no son datos de clientes.',
        head: ['external_id', 'Dispositivo', 'Calif.', 'Puntos', 'Estado'],
        rows: [
          ['LOT52-ITEM390', 'iPhone 13', 'A', '92', 'completado'],
          ['LOT52-ITEM391', 'iPad (9.ª gen.)', 'C', '73', 'completado'],
          ['LOT52-ITEM392', 'iPhone 13', 'B', '84', 'en revisión: batería sin revisar'],
          ['LOT52-ITEM393', 'Galaxy S21', '–', '–', 'foto rechazada: reverso muy oscuro']
        ] },
      fit: { k: 'Alcance', h: 'La evaluación estética es un paso, no toda la disposición final.',
        does: ['Califica el estado estético visible de teléfonos, tabletas, laptops y relojes.', 'Devuelve tus referencias con cada resultado, por API, webhooks y CSV.', 'Aplica tu estándar y registra qué versión calificó cada dispositivo.'],
        doesnt: ['No hace sanitización ni emite certificados de borrado.', 'No hace diagnóstico funcional ni revisiones de IMEI o lista negra.', 'No valúa activos ni certifica cadena de custodia o cumplimiento.'] },
      evaluate: { k: 'Evaluación', h: 'Una calibración lado a lado con tu propio inventario.', steps: ['Compártenos tu estándar de calificación, o constrúyelo tú como copia del inphox Standard.', 'Califica una muestra de dispositivos que tu equipo ya calificó, con sus ID de activo como external_id.', 'Exporta ambos conjuntos y compara la variación de calificaciones, el tiempo de fotos por dispositivo y las excepciones que siguieron requiriendo a una persona.'] },
      faq: [
        { q: '¿Esto reemplaza nuestra plataforma ITAD?', a: 'No. Suma una calificación estética a los registros que ya llevas, por API, webhooks o exportación CSV.' },
        { q: '¿Podemos evitar que se guarden las fotos?', a: 'La retención cero, en la que las fotos se borran en cuanto se califica cada dispositivo, es un ajuste de la cuenta que se está habilitando. Revisa la sección de datos de la documentación de la API para ver su disponibilidad actual.' },
        { q: '¿Qué mide una prueba piloto?', a: 'La variación frente a tus evaluadores, el tiempo de captura por dispositivo, la carga de los operadores y el retrabajo. No prometemos un resultado antes de medirlo con tus dispositivos.' }
      ],
      close: { h: 'Trae una muestra de tu inventario.', p: 'Cuéntanos tu estándar de calificación y tu volumen, y preparamos una evaluación lado a lado.' }
    }
  },

  'repair-shops': {
    example: 'steps',
    en: {
      kicker: 'Autograding for repair shops',
      h1: ['Professional cosmetic grading', 'without a complicated setup.'],
      intro: 'Open an account, take photos of a device with the phone in your pocket, and get a grade with the reasons behind it. You pay for the devices you grade from prepaid credits. No new hardware, no contract, and nothing to switch in your repair or point-of-sale software.',
      cta: { primary: { label: 'Start grading free', to: 'start' }, secondary: { label: 'See an example result', to: 'example' } },
      flow: { k: 'How it works', h: 'Three steps, the first time and every time.', steps: [
        ['Photograph', 'The app’s camera walks you round the device: front, back and edges.'],
        ['Read the grade', 'A score, a grade and what was found on each side, in about 7–8 seconds.'],
        ['Use it', 'Show the customer, send a share link, or note the grade on your ticket.']
      ] },
      sections: [
        { k: '01', h: 'The tools you already have', p: 'A recent phone camera is enough. Wipe the device, take the case off, find soft even light without flash glare, and fill the frame with one side at a time. If a photo is too dark or blurry, it is refused with the reason, and you are not charged for it.' },
        { k: '02', h: 'Something a customer can look at', p: 'Instead of “it’s in fair shape”, show the grade and the findings: light scratches on the glass, a dent on the bottom edge. A share link shows the grade, what was seen and the photos, and you can turn it off at any time.' },
        { k: '03', h: 'The same rules on every bench', p: 'Your grading standard is a short list of settings: how many points a scratch or a dent takes off, and where A, B, C and D start. Set it once and everyone in the shop grades the same way, including the new hire.' },
        { k: '04', h: 'Prices you can see before you start', p: 'Prepaid credits, starting from free credits when you sign up. On the starting tier a device costs at most $0.10, and the price goes down as you add more over a year. A device that fails to grade is never charged. The current numbers are always on the pricing page.' },
        { k: '05', h: 'Use it on its own', p: 'inphox autograde does not ask you to move your tickets, inventory or sales into it. It works next to whatever you use today, and it is separate from inphox Inventory unless you want both.' }
      ],
      example: { k: 'Example', h: 'What a result looks like.', note: 'Illustrative: this is the documented example result from our API docs, shown the way the app lays it out.',
        result: { grade: 'B', score: '84', standard: 'inphox Standard, version 1', sides: [['Front', 'A', '93', 'Light scratches on the glass'], ['Back', 'B', '84', 'Noticeable wear on the housing']] } },
      fit: { k: 'Boundaries', h: 'Good to know before your first device.',
        does: ['Phones, tablets, laptops and smartwatches.', 'Cosmetic condition from photos: scratches, scuffs, dents, cracks, chips, discoloration.', 'You answer the battery-swelling question by hand; the grade waits for it.'],
        doesnt: ['No functional or battery-health tests.', 'No IMEI, carrier or blacklist checks.', 'No price for the device: what you pay or charge is up to you.'] },
      evaluate: { k: 'Try it', h: 'Your first grade, on your own.', steps: ['Sign up with your name and email.', 'Grade a device you know well, and see if the grade matches what you would say.', 'Grade the next five that come in, and decide whether it saves you an argument.'] },
      faq: [
        { q: 'Do I need special lights or a booth?', a: 'No. Soft, even light and a clean, case-free device matter more than equipment. The app tells you when a photo cannot be judged.' },
        { q: 'Is there a monthly fee?', a: 'No subscription is required: you add prepaid credits and each graded device uses some. See the pricing page for today’s numbers.' },
        { q: 'Can my staff use it?', a: 'Yes. Everyone grades with the same standard, so the result does not depend on who took the photos.' }
      ],
      close: { h: 'Grade your next device with us.', p: 'Sign up free and see the result in seconds.' }
    },
    es: {
      kicker: 'Autograding para talleres de reparación',
      h1: ['Evaluación estética profesional de dispositivos,', 'sin configuraciones complicadas.'],
      intro: 'Abre una cuenta, toma fotos de un dispositivo con el teléfono que llevas en el bolsillo y recibe una calificación con sus motivos. Pagas los dispositivos que calificas con créditos prepagados. Sin equipo nuevo, sin contrato y sin cambiar tu software de reparación o punto de venta.',
      cta: { primary: { label: 'Empieza a calificar gratis', to: 'start' }, secondary: { label: 'Ve un resultado de ejemplo', to: 'example' } },
      flow: { k: 'Cómo funciona', h: 'Tres pasos, la primera vez y siempre.', steps: [
        ['Fotografía', 'La cámara de la app te guía alrededor del dispositivo: frente, reverso y bordes.'],
        ['Lee la calificación', 'Una puntuación, una calificación y lo que se encontró en cada lado, en 7–8 segundos.'],
        ['Úsala', 'Muéstrala al cliente, envía un enlace o anótala en tu orden de servicio.']
      ] },
      sections: [
        { k: '01', h: 'Las herramientas que ya tienes', p: 'Basta con la cámara de un teléfono reciente. Limpia el dispositivo, quítale la funda, busca luz suave y pareja sin reflejos de flash y llena el cuadro con un lado a la vez. Si una foto sale oscura o borrosa, se rechaza con el motivo y no se cobra.' },
        { k: '02', h: 'Algo que el cliente puede ver', p: 'En lugar de “está en buen estado”, muestra la calificación y los hallazgos: rayones leves en el vidrio, una abolladura en el borde inferior. Un enlace compartido muestra la calificación, lo que se vio y las fotos, y puedes desactivarlo cuando quieras.' },
        { k: '03', h: 'Las mismas reglas en cada mesa', p: 'Tu estándar de calificación es una lista corta de ajustes: cuántos puntos resta un rayón o una abolladura y dónde empiezan A, B, C y D. Lo defines una vez y todo el taller califica igual, incluido quien acaba de llegar.' },
        { k: '04', h: 'Precios a la vista antes de empezar', p: 'Créditos prepagados, empezando con créditos gratis al registrarte. En el nivel inicial un dispositivo cuesta como máximo $0.10, y el precio baja conforme agregas más en el año. Un dispositivo que no se puede calificar nunca se cobra. Los números actuales siempre están en la página de precios.' },
        { k: '05', h: 'Úsalo por separado', p: 'inphox autograde no te pide mover tus órdenes, inventario o ventas. Funciona junto a lo que ya usas y es independiente de inphox Inventory, salvo que quieras ambos.' }
      ],
      example: { k: 'Ejemplo', h: 'Así se ve un resultado.', note: 'Ilustrativo: es el resultado de ejemplo documentado en nuestra API, presentado como lo muestra la app.',
        result: { grade: 'B', score: '84', standard: 'inphox Standard, versión 1', sides: [['Frente', 'A', '93', 'Rayones leves en el vidrio'], ['Reverso', 'B', '84', 'Desgaste notable en la carcasa']] } },
      fit: { k: 'Alcance', h: 'Bueno saberlo antes de tu primer dispositivo.',
        does: ['Teléfonos, tabletas, laptops y relojes inteligentes.', 'Estado estético a partir de fotos: rayones, roces, abolladuras, grietas, despostilladuras, decoloración.', 'Tú respondes a mano la pregunta de batería inflada; la calificación la espera.'],
        doesnt: ['No hace pruebas funcionales ni de salud de batería.', 'No revisa IMEI, operador ni lista negra.', 'No le pone precio al dispositivo: lo que pagas o cobras lo decides tú.'] },
      evaluate: { k: 'Pruébalo', h: 'Tu primera calificación, por tu cuenta.', steps: ['Regístrate con tu nombre y correo.', 'Califica un dispositivo que conozcas bien y mira si coincide con lo que tú dirías.', 'Califica los siguientes cinco que lleguen y decide si te ahorra una discusión.'] },
      faq: [
        { q: '¿Necesito luces especiales o una cabina?', a: 'No. Importan más la luz suave y pareja y un dispositivo limpio y sin funda que el equipo. La app te avisa cuando una foto no se puede juzgar.' },
        { q: '¿Hay una cuota mensual?', a: 'No se requiere suscripción: agregas créditos prepagados y cada dispositivo calificado usa una parte. Consulta la página de precios para los números de hoy.' },
        { q: '¿Mi personal puede usarlo?', a: 'Sí. Todos califican con el mismo estándar, así que el resultado no depende de quién tomó las fotos.' }
      ],
      close: { h: 'Califica tu próximo dispositivo con nosotros.', p: 'Regístrate gratis y ve el resultado en segundos.' }
    }
  },

  api: {
    example: 'api',
    en: {
      kicker: 'Autograding for developers',
      h1: ['Add cosmetic device grading to your software', 'through an open API.'],
      intro: 'Building image analysis and a grading rulebook is a project of its own. The inphox autograde API takes photos of a phone, tablet, laptop or smartwatch and returns a score, a grade and the findings on each side, graded with a profile your users choose. The documentation and the OpenAPI file are public; you can read all of it before you sign up.',
      cta: { primary: { label: 'Read the API docs', to: 'docs' }, secondary: { label: 'Create an API key', to: 'developers' } },
      flow: { k: 'The sequence', h: 'Upload, submit, get told, fetch.', steps: [
        ['POST /v1/uploads', 'One request per photo. Keep each upload_id.'],
        ['POST /v1/grades', 'The device type, its photos by side, your external_id. Answers at once: queued.'],
        ['Webhook or poll', 'grade.completed arrives signed, or poll GET /v1/grades/{job_id}.'],
        ['GET /v1/grades/{id}', 'Score, grade, condition per category, findings per side, the profile version.']
      ] },
      sections: [
        { k: '01', h: 'An independent service', p: 'The API needs no inphox software on your side. A key acts as its owner: their balance, devices, grading profiles, configurations and webhooks. Typical uses are trade-in flows, inventory and ITAD platforms, marketplaces that want a condition report on a listing, and internal tools.' },
        { k: '02', h: 'Asynchronous by design', p: 'Nothing stays open while grading runs. Subscribe an endpoint and receive grade.completed, grade.failed, grade.needs_retake, grade.cancelled and batch.completed, signed per the Standard Webhooks spec and retried on a published schedule, with every delivery listed and re-sendable. Or poll every few seconds.' },
        { k: '03', h: 'Profiles your users control', p: 'A profile (grading standard) sets points per condition, caps for damage like cracked glass, how findings stack and where each grade starts. Profiles are versioned, and every result names the version that made it. View as re-reads a finished grade under another profile, free, without new photos.' },
        { k: '04', h: 'Built for retries and volume', p: 'Send an Idempotency-Key on POST /v1/grades and /v1/batches: a retry returns the first answer, never a second job or charge. Batches take any number of devices; results come paged as JSON or as CSV. Errors are plain JSON, a failed job carries a code for what went wrong, and every response has an X-Trace-Id.', list: ['Idempotency-Key on every create', 'Batches with JSON or CSV results', 'Drafts that reopen a refused side'] },
        { k: '05', h: 'Data handling', p: 'Photos and results are never sold. Accounts can opt out of improvement use. Zero data retention, where photos are deleted as soon as each device is graded, is an account setting being rolled out: the data section of the docs says what is available today and what remains (the findings and the grade).' },
        { k: '06', h: 'Usage and pricing', p: 'Prepaid credits, the same in the app and the API: on the starting tier, at most $0.10 a device, lower with volume. A failed or cancelled device is refunded. GET /v1/pricing returns the current numbers and GET /v1/balance your balance. Auto-refill keeps an integration from stalling. There is no published uptime SLA; the status page shows live component health.' }
      ],
      example: { k: 'Example', h: 'A request and its result.', note: 'From the published API docs. Replace the key and upload ids with your own.',
        request: 'curl -X POST https://autograding.inphox.net/v1/grades \\\n  -H "Authorization: Bearer $KEY" \\\n  -H "Content-Type: application/json" \\\n  -H "Idempotency-Key: lot52-item392" \\\n  -d \'{"device_type": "phone", "external_id": "LOT52-ITEM392",\n       "images": [{"side": "front", "upload_id": "UPLOAD_ID"},\n                  {"side": "back", "upload_id": "UPLOAD_ID_2"}]}\'',
        response: '{\n  "job_id": "b6f0c1d2-\u2026",\n  "status": "completed",\n  "external_id": "LOT52-ITEM392",\n  "result": {\n    "score": 84,\n    "grade": "B",\n    "condition": {\n      "scratches": "light",\n      "scuffs": "moderate",\n      "dents": "none"\n    },\n    "profile": {\n      "name": "inphox Standard",\n      "version": 1\n    },\n    "worst_side": "back",\n    "sides": [\n      { "side": "front", "score": 93,\n        "grade": "A",\n        "findings": ["Light scratches on the glass"] },\n      { "side": "back", "score": 84,\n        "grade": "B",\n        "findings": ["Noticeable wear on the housing"] }\n    ]\n  }\n}' },
      fit: { k: 'Boundaries', h: 'What the API does and does not cover.',
        does: ['Cosmetic grading of phones, tablets, laptops and smartwatches from 1 to 8 photos.', 'Profiles, configurations, batches, webhooks, share links and cross-account compare.', 'An OpenAPI file and a plain-text copy of the docs for code generation and AI agents.'],
        doesnt: ['No official SDKs yet: call the REST API from any language.', 'No functional, IMEI or blacklist checks.', 'No published SLA or throughput guarantee.'] },
      evaluate: { k: 'Get started', h: 'From reading to a first result.', steps: ['Read the docs, especially the photo rules: they decide whether grades succeed.', 'Sign up and create a key in the app: Account, API, Create key. It is shown once.', 'Grade one device by hand with curl, then wire up a webhook and an Idempotency-Key before you send volume.'] },
      faq: [
        { q: 'Is there a sandbox?', a: 'Not a separate one. New accounts start with free credits, and failed devices are never charged, so you can test against the live API.' },
        { q: 'How do we verify webhooks?', a: 'Each delivery is signed with HMAC-SHA256 per Standard Webhooks; the docs include a Python verifier and the retry schedule.' },
        { q: 'Can our users bring their own grading standard?', a: 'Yes. Create a profile per standard through /v1/profiles and pass its profile_id, or set it as the default.' }
      ],
      close: { h: 'Read the docs, then grade your first device.', p: 'Public documentation, an OpenAPI file and prepaid usage. No sales call required.' }
    },
    es: {
      kicker: 'Autograding para desarrolladores',
      h1: ['Integra la evaluación estética de dispositivos en tu software', 'mediante una API abierta.'],
      intro: 'Construir análisis de imágenes y un reglamento de calificación es un proyecto en sí mismo. La API de inphox autograde recibe fotos de un teléfono, tableta, laptop o reloj inteligente y devuelve una puntuación, una calificación y los hallazgos de cada lado, calificados con un perfil que eligen tus usuarios. La documentación y el archivo OpenAPI son públicos; puedes leerlos completos antes de registrarte.',
      cta: { primary: { label: 'Lee la documentación de la API', to: 'docs' }, secondary: { label: 'Crea una clave de API', to: 'developers' } },
      flow: { k: 'La secuencia', h: 'Sube, envía, recibe el aviso y consulta.', steps: [
        ['POST /v1/uploads', 'Una solicitud por foto. Guarda cada upload_id.'],
        ['POST /v1/grades', 'El tipo de dispositivo, sus fotos por lado, tu external_id. Responde al instante: queued.'],
        ['Webhook o consulta', 'grade.completed llega firmado, o consulta GET /v1/grades/{job_id}.'],
        ['GET /v1/grades/{id}', 'Puntuación, calificación, condición por categoría, hallazgos por lado y la versión del perfil.']
      ] },
      sections: [
        { k: '01', h: 'Un servicio independiente', p: 'La API no requiere software de inphox de tu lado. Una clave actúa como su dueño: su saldo, dispositivos, perfiles de calificación, configuraciones y webhooks. Usos típicos: flujos de canje, plataformas de inventario e ITAD, marketplaces que quieren un reporte de estado en cada publicación y herramientas internas.' },
        { k: '02', h: 'Asíncrona por diseño', p: 'Nada queda abierto mientras se califica. Suscribe un endpoint y recibe grade.completed, grade.failed, grade.needs_retake, grade.cancelled y batch.completed, firmados según la especificación Standard Webhooks y reintentados según un calendario publicado, con cada entrega listada y reenviable. O consulta cada pocos segundos.' },
        { k: '03', h: 'Perfiles que controlan tus usuarios', p: 'Un perfil (estándar de calificación) define los puntos por condición, topes para daños como vidrio roto, cómo se acumulan los hallazgos y dónde empieza cada calificación. Los perfiles tienen versiones y cada resultado nombra la versión que lo produjo. View as relee una calificación terminada con otro perfil, sin costo y sin fotos nuevas.' },
        { k: '04', h: 'Hecha para reintentos y volumen', p: 'Envía un Idempotency-Key en POST /v1/grades y /v1/batches: un reintento devuelve la primera respuesta, nunca un segundo trabajo ni un segundo cobro. Los lotes aceptan cualquier cantidad de dispositivos; los resultados llegan paginados en JSON o en CSV. Los errores son JSON simple, un trabajo fallido trae un código de lo que salió mal y cada respuesta tiene un X-Trace-Id.', list: ['Idempotency-Key en cada creación', 'Lotes con resultados en JSON o CSV', 'Borradores que reabren un lado rechazado'] },
        { k: '05', h: 'Manejo de datos', p: 'Las fotos y los resultados nunca se venden. Las cuentas pueden excluirse del uso para mejoras. La retención cero, en la que las fotos se borran en cuanto se califica cada dispositivo, es un ajuste de la cuenta que se está habilitando: la sección de datos de la documentación dice qué está disponible hoy y qué se conserva (los hallazgos y la calificación).' },
        { k: '06', h: 'Uso y precios', p: 'Créditos prepagados, iguales en la app y en la API: en el nivel inicial, como máximo $0.10 por dispositivo, menos con volumen. Un dispositivo fallido o cancelado se reembolsa. GET /v1/pricing devuelve los números actuales y GET /v1/balance tu saldo. La recarga automática evita que una integración se detenga. No hay un SLA de disponibilidad publicado; la página de estado muestra la salud de cada componente en vivo.' }
      ],
      example: { k: 'Ejemplo', h: 'Una solicitud y su resultado.', note: 'Tomado de la documentación pública de la API. Sustituye la clave y los upload_id por los tuyos.',
        request: null, response: null },
      fit: { k: 'Alcance', h: 'Qué cubre la API y qué no.',
        does: ['Evaluación estética de teléfonos, tabletas, laptops y relojes con 1 a 8 fotos.', 'Perfiles, configuraciones, lotes, webhooks, enlaces compartidos y comparación entre cuentas.', 'Un archivo OpenAPI y una copia en texto plano de la documentación para generar código y para agentes de IA.'],
        doesnt: ['Todavía no hay SDK oficiales: llama a la API REST desde cualquier lenguaje.', 'No hace revisiones funcionales, de IMEI ni de lista negra.', 'No hay SLA ni garantía de rendimiento publicados.'] },
      evaluate: { k: 'Primeros pasos', h: 'De la lectura al primer resultado.', steps: ['Lee la documentación, sobre todo las reglas de fotos: deciden si una calificación sale bien.', 'Regístrate y crea una clave en la app: Account, API, Create key. Se muestra una sola vez.', 'Califica un dispositivo a mano con curl y después configura un webhook y un Idempotency-Key antes de enviar volumen.'] },
      faq: [
        { q: '¿Hay un entorno de pruebas?', a: 'No uno aparte. Las cuentas nuevas empiezan con créditos gratis y los dispositivos fallidos nunca se cobran, así que puedes probar contra la API real.' },
        { q: '¿Cómo verificamos los webhooks?', a: 'Cada entrega va firmada con HMAC-SHA256 según Standard Webhooks; la documentación incluye un verificador en Python y el calendario de reintentos.' },
        { q: '¿Nuestros usuarios pueden usar su propio estándar?', a: 'Sí. Crea un perfil por estándar con /v1/profiles y pasa su profile_id, o márcalo como predeterminado.' }
      ],
      close: { h: 'Lee la documentación y califica tu primer dispositivo.', p: 'Documentación pública, un archivo OpenAPI y uso prepagado. Sin llamada de ventas.' }
    }
  },

  wholesale: {
    example: 'viewas',
    en: {
      kicker: 'Autograding for wholesale and liquidation',
      h1: ['Read a supplier’s grade', 'under your own buying standard.'],
      intro: 'A “B” on a supplier’s manifest is their B, not yours. With inphox autograde, a supplier who grades a device can share it with you, and you read the same inspection under your own grading standard before the lot changes hands. Neither side sees the other’s rules.',
      cta: { primary: { label: 'Grade a sample lot', to: 'start' }, secondary: { label: 'Talk about supplier evaluation', to: 'contact' } },
      flow: { k: 'Where it fits', h: 'Between the manifest and the purchase order.', steps: [
        ['Supplier grades', 'Photos of the devices, graded on the supplier’s own standard.'],
        ['Supplier shares', 'A link per device, valid for an hour up to 30 days, that they can turn off.'],
        ['You compare', 'The same findings, scored and graded under your standard.'],
        ['You decide', 'Price the lot on your grades, or ask for more photos.']
      ] },
      sections: [
        { k: '01', h: 'Two companies, two meanings of B', p: 'Wholesale grades are labels each seller defines. The comparison in inphox autograde starts from what the inspection found on each side (the same for every account) and applies your standard to it. You get the supplier’s letter and your own grade and score, side by side.' },
        { k: '02', h: 'What each side sees', p: 'You see the supplier’s grade letter, your grade and score, what was seen on each side and small photos where photos are kept. You never see the supplier’s score, scale, standard, labels or account. They see how many times the link was opened, not who opened it or what you graded.', list: ['Comparing is free: nothing is graded again', 'One answer for every bad link, so links cannot be probed', 'The owner can turn a link off at any time'] },
        { k: '03', h: 'Lots, not single phones', p: 'Grade your own sample of a lot as a batch: drop a folder per device on the Upload page or send it through the API, follow progress, then export grades, scores and your references as CSV. Read the same results under a second standard with View as, free.' },
        { k: '04', h: 'Supplier history you can keep', p: 'Tag devices with the supplier, lot and manifest grade as labels, and export them with your grades. Over a few lots you can see where a supplier’s B and your B part ways, from your own data rather than memory.' }
      ],
      example: { k: 'Example', h: 'One device, read two ways.', note: 'Illustrative example of a comparison. The findings are from the documented example in our API docs; the supplier’s letter and your standard’s numbers are made up to show the idea.',
        sides: [['Supplier’s grade', 'A', 'Their standard, which you never see.'], ['Your grade', 'B · 84', 'Your standard, applied to the same findings: light scratches on the glass, noticeable wear on the back.']] },
      fit: { k: 'Boundaries', h: 'What the comparison can and cannot tell you.',
        does: ['Re-reads a supplier’s inspection under your standard, free.', 'Grades your own samples in batches, with CSV export.', 'Keeps labels for supplier, lot and manifest grade.'],
        doesnt: ['It cannot see what the supplier did not photograph.', 'No functional, IMEI or blacklist checks.', 'It does not price the lot or guarantee the supplier’s photos match the units shipped.'] },
      evaluate: { k: 'Evaluate', h: 'Start with one supplier and one lot.', steps: ['Write your buying standard as a copy of the inphox Standard.', 'Grade a sample from a recent lot, tagged with the manifest grade.', 'Export and compare: how often did the manifest grade match yours?'] },
      faq: [
        { q: 'Does the supplier need an account?', a: 'Yes, to grade and share. You need one to compare: a comparison requires an API key or a signed-in session.' },
        { q: 'Can a supplier fake a grade with this?', a: 'A share link names one stored inspection made from the supplier’s photos. It cannot prove those photos show the unit you receive; spot-check on arrival.' },
        { q: 'What does comparing cost?', a: 'Nothing. Comparing and View as re-read an existing inspection; nothing is graded again.' }
      ],
      close: { h: 'Grade a sample of your next lot.', p: 'Sign up, set your buying standard and grade a handful of devices.' }
    },
    es: {
      kicker: 'Autograding para mayoreo y liquidación',
      h1: ['Lee la calificación de un proveedor', 'con tu propio estándar de compra.'],
      intro: 'Una “B” en el manifiesto de un proveedor es su B, no la tuya. Con inphox autograde, un proveedor que califica un dispositivo puede compartirlo contigo, y tú lees la misma inspección con tu propio estándar antes de cerrar el lote. Ninguna de las partes ve las reglas de la otra.',
      cta: { primary: { label: 'Califica un lote de muestra', to: 'start' }, secondary: { label: 'Habla de evaluar proveedores', to: 'contact' } },
      flow: { k: 'Dónde encaja', h: 'Entre el manifiesto y la orden de compra.', steps: [
        ['El proveedor califica', 'Fotos de los dispositivos, calificadas con el estándar del proveedor.'],
        ['El proveedor comparte', 'Un enlace por dispositivo, válido de una hora a 30 días, que puede desactivar.'],
        ['Tú comparas', 'Los mismos hallazgos, puntuados y calificados con tu estándar.'],
        ['Tú decides', 'Pon precio al lote con tus calificaciones, o pide más fotos.']
      ] },
      sections: [
        { k: '01', h: 'Dos empresas, dos significados de B', p: 'Las calificaciones de mayoreo son etiquetas que define cada vendedor. La comparación en inphox autograde parte de lo que la inspección encontró en cada lado (igual para todas las cuentas) y le aplica tu estándar. Recibes la letra del proveedor y tu propia calificación y puntuación, lado a lado.' },
        { k: '02', h: 'Qué ve cada parte', p: 'Tú ves la letra del proveedor, tu calificación y puntuación, lo que se vio en cada lado y fotos pequeñas cuando se conservan. Nunca ves la puntuación, escala, estándar, etiquetas ni cuenta del proveedor. El proveedor ve cuántas veces se abrió el enlace, no quién lo abrió ni qué calificaste.', list: ['Comparar es gratis: nada se vuelve a calificar', 'Una sola respuesta para cualquier enlace inválido, para que no se puedan sondear', 'El dueño puede desactivar un enlace en cualquier momento'] },
        { k: '03', h: 'Lotes, no teléfonos sueltos', p: 'Califica tu propia muestra de un lote como batch: arrastra una carpeta por dispositivo a la página Upload o envíala por la API, sigue el avance y exporta calificaciones, puntuaciones y tus referencias en CSV. Lee los mismos resultados con un segundo estándar usando View as, sin costo.' },
        { k: '04', h: 'Un historial de proveedores que puedes conservar', p: 'Etiqueta los dispositivos con el proveedor, el lote y la calificación del manifiesto, y expórtalos con tus calificaciones. En pocos lotes verás dónde se separan la B del proveedor y la tuya, con tus propios datos y no de memoria.' }
      ],
      example: { k: 'Ejemplo', h: 'Un dispositivo, leído de dos formas.', note: 'Ejemplo ilustrativo de una comparación. Los hallazgos vienen del ejemplo documentado en nuestra API; la letra del proveedor y los números de tu estándar son inventados para mostrar la idea.',
        sides: [['Calificación del proveedor', 'A', 'Su estándar, que nunca ves.'], ['Tu calificación', 'B · 84', 'Tu estándar, aplicado a los mismos hallazgos: rayones leves en el vidrio y desgaste notable en el reverso.']] },
      fit: { k: 'Alcance', h: 'Lo que la comparación puede decirte y lo que no.',
        does: ['Relee la inspección de un proveedor con tu estándar, sin costo.', 'Califica tus propias muestras por lotes, con exportación CSV.', 'Guarda etiquetas de proveedor, lote y calificación del manifiesto.'],
        doesnt: ['No puede ver lo que el proveedor no fotografió.', 'No hace revisiones funcionales, de IMEI ni de lista negra.', 'No pone precio al lote ni garantiza que las fotos correspondan a las unidades enviadas.'] },
      evaluate: { k: 'Evaluación', h: 'Empieza con un proveedor y un lote.', steps: ['Escribe tu estándar de compra como copia del inphox Standard.', 'Califica una muestra de un lote reciente, etiquetada con la calificación del manifiesto.', 'Exporta y compara: ¿cuántas veces coincidió la calificación del manifiesto con la tuya?'] },
      faq: [
        { q: '¿El proveedor necesita una cuenta?', a: 'Sí, para calificar y compartir. Tú necesitas una para comparar: una comparación requiere una clave de API o una sesión iniciada.' },
        { q: '¿Un proveedor podría falsear una calificación?', a: 'Un enlace compartido nombra una inspección guardada, hecha con las fotos del proveedor. No puede probar que esas fotos muestren la unidad que recibes; revisa muestras al llegar.' },
        { q: '¿Cuánto cuesta comparar?', a: 'Nada. Comparar y View as releen una inspección existente; nada se vuelve a calificar.' }
      ],
      close: { h: 'Califica una muestra de tu próximo lote.', p: 'Regístrate, define tu estándar de compra y califica algunos dispositivos.' }
    }
  },

  refurbishers: {
    example: 'beforeafter',
    en: {
      kicker: 'Autograding for refurbishers and remarketers',
      h1: ['Document the condition at intake,', 'after the work, and before resale.'],
      intro: 'A refurbished device has more than one condition: the one it arrived in, the one it left the bench in, and the one the buyer receives. inphox autograde grades each from photos under one reference, so you can show what the work changed and what the buyer gets.',
      cta: { primary: { label: 'Grade your next intake', to: 'start' }, secondary: { label: 'Plan a workflow with us', to: 'contact' } },
      flow: { k: 'Where it fits', h: 'Three grades, one reference.', steps: [
        ['Intake grade', 'Photos as the device arrives. The grade decides what work it needs.'],
        ['After refurbishment', 'New photos after housing, glass or polish work. A new grade, same reference.'],
        ['Before resale', 'A share link with the final grade, findings and photos for the buyer.']
      ] },
      sections: [
        { k: '01', h: 'Grades that route the work', p: 'An intake grade with its findings tells the bench what to do: a light scratch on the glass is a polish, a chipped back is a part. Each condition comes with its severity, so you can decide where the line between “polish” and “replace” sits for your own shop.' },
        { k: '02', h: 'Before and after, comparable', p: 'Grade the device again after the work with the same standard and the same external_id. Each grade keeps its own photos, findings and standard version, so the two records compare like with like and neither overwrites the other.' },
        { k: '03', h: 'A resale grade the buyer can check', p: 'Share the final grade as a link with the findings and photos. A business buyer with their own account can read the same inspection under their standard, which helps when your A and theirs are not the same A.' },
        { k: '04', h: 'Your standard, versioned', p: 'Refurbishers often grade stricter than trade-in desks. Set your own points, caps and grade cut-offs; every change is a new version, and every result names its version, so an audit months later reads the grade the way it was made.' },
        { k: '05', h: 'Every device\u2019s path through the bench', p: 'Grade intake at volume from the Upload page (a folder per device, or files named by your reference) and tag each grade with its stage as a label: intake, refurbished, resale. Export by reference as CSV and you have each device\u2019s grades side by side, ready for your own reports on what the bench changed.', list: ['stage: intake | refurbished | resale', 'external_id: your stock number', 'CSV or JSON export, by batch or by search'] }
      ],
      example: { k: 'Example', h: 'One device through the bench.', note: 'Illustrative example. Each row is a separate grade of the same device, under the same reference; the numbers are made up to show the idea.',
        rows: [['Intake', 'C · 72', 'Moderate scratches on the glass; chip on the back'], ['After refurbishment', 'A · 93', 'New back glass; light scratches on the front glass'], ['Before resale', 'A · 93', 'Shared with the buyer as a link, with photos']] },
      fit: { k: 'Boundaries', h: 'Cosmetic records, not a refurbishment system.',
        does: ['Separate grades for each stage, kept side by side under your reference.', 'Findings and severities per side to route work.', 'Share links and cross-account compare for buyers.'],
        doesnt: ['No functional testing or parts tracking.', 'No IMEI, carrier or blacklist checks.', 'It does not decide repairs: your technicians do.'] },
      evaluate: { k: 'Evaluate', h: 'Follow ten devices through your bench.', steps: ['Grade ten devices at intake, on your standard.', 'Grade them again when the work is done, with the same external_id.', 'Check whether the intake findings matched the work your technicians actually did.'] },
      faq: [
        { q: 'Do I pay for each stage?', a: 'Yes, each grade is a separate graded device. Re-reading an existing grade under another standard (View as) is free.' },
        { q: 'Can buyers see the intake grade?', a: 'Only what you share. A share link names one grade; share the final one.' },
        { q: 'Does it grade laptops?', a: 'Yes: phones, tablets, laptops (lid, bottom, keyboard, screen and edges) and smartwatches.' }
      ],
      close: { h: 'Grade your next intake.', p: 'Sign up and see the findings that route the work.' }
    },
    es: {
      kicker: 'Autograding para reacondicionadores y revendedores',
      h1: ['Documenta el estado al recibir,', 'después del trabajo y antes de vender.'],
      intro: 'Un dispositivo reacondicionado tiene más de un estado: el que tenía al llegar, el que tiene al salir de la mesa y el que recibe el comprador. inphox autograde califica cada uno a partir de fotos con una sola referencia, para mostrar qué cambió el trabajo y qué recibe el comprador.',
      cta: { primary: { label: 'Califica tu próxima recepción', to: 'start' }, secondary: { label: 'Planea un flujo con nosotros', to: 'contact' } },
      flow: { k: 'Dónde encaja', h: 'Tres calificaciones, una referencia.', steps: [
        ['Calificación de recepción', 'Fotos al llegar el dispositivo. La calificación decide qué trabajo necesita.'],
        ['Después del reacondicionamiento', 'Fotos nuevas tras cambiar carcasa o vidrio o pulir. Nueva calificación, misma referencia.'],
        ['Antes de vender', 'Un enlace con la calificación final, los hallazgos y las fotos para el comprador.']
      ] },
      sections: [
        { k: '01', h: 'Calificaciones que dirigen el trabajo', p: 'Una calificación de recepción con sus hallazgos le dice a la mesa qué hacer: un rayón leve en el vidrio se pule, un reverso despostillado es una pieza. Cada condición viene con su severidad, así decides dónde está el límite entre “pulir” y “reemplazar” en tu taller.' },
        { k: '02', h: 'Antes y después, comparables', p: 'Vuelve a calificar el dispositivo después del trabajo con el mismo estándar y el mismo external_id. Cada calificación guarda sus fotos, hallazgos y versión del estándar, así los dos registros se comparan en igualdad y ninguno reemplaza al otro.' },
        { k: '03', h: 'Una calificación de venta que el comprador puede revisar', p: 'Comparte la calificación final como enlace con los hallazgos y las fotos. Un comprador empresarial con su propia cuenta puede leer la misma inspección con su estándar, útil cuando tu A y la suya no son la misma A.' },
        { k: '04', h: 'Tu estándar, con versiones', p: 'Los reacondicionadores suelen calificar con más rigor que un mostrador de canje. Define tus puntos, topes y límites; cada cambio es una versión nueva y cada resultado nombra la suya, así una auditoría meses después lee la calificación tal como se hizo.' },
        { k: '05', h: 'El recorrido de cada dispositivo por la mesa', p: 'Califica recepciones en volumen desde la página Upload (una carpeta por dispositivo, o archivos con tu referencia en el nombre) y etiqueta cada calificación con su etapa: recepción, reacondicionado, venta. Exporta por referencia en CSV y tendrás las calificaciones de cada dispositivo lado a lado, listas para tus propios reportes sobre lo que cambió la mesa.', list: ['etapa: recepción | reacondicionado | venta', 'external_id: tu número de inventario', 'Exportación CSV o JSON, por lote o por búsqueda'] }
      ],
      example: { k: 'Ejemplo', h: 'Un dispositivo a través de la mesa.', note: 'Ejemplo ilustrativo. Cada fila es una calificación distinta del mismo dispositivo, con la misma referencia; los números son inventados para mostrar la idea.',
        rows: [['Recepción', 'C · 72', 'Rayones moderados en el vidrio; despostilladura en el reverso'], ['Después del reacondicionamiento', 'A · 93', 'Vidrio trasero nuevo; rayones leves en el vidrio frontal'], ['Antes de vender', 'A · 93', 'Compartida con el comprador como enlace, con fotos']] },
      fit: { k: 'Alcance', h: 'Registros estéticos, no un sistema de reacondicionamiento.',
        does: ['Calificaciones separadas por etapa, guardadas lado a lado con tu referencia.', 'Hallazgos y severidades por lado para dirigir el trabajo.', 'Enlaces compartidos y comparación entre cuentas para compradores.'],
        doesnt: ['No hace pruebas funcionales ni control de piezas.', 'No revisa IMEI, operador ni lista negra.', 'No decide reparaciones: eso lo hacen tus técnicos.'] },
      evaluate: { k: 'Evaluación', h: 'Sigue diez dispositivos por tu mesa.', steps: ['Califica diez dispositivos al recibirlos, con tu estándar.', 'Vuelve a calificarlos al terminar el trabajo, con el mismo external_id.', 'Revisa si los hallazgos de recepción coincidieron con el trabajo que hicieron tus técnicos.'] },
      faq: [
        { q: '¿Pago cada etapa?', a: 'Sí, cada calificación es un dispositivo calificado aparte. Releer una calificación existente con otro estándar (View as) es gratis.' },
        { q: '¿Los compradores pueden ver la calificación de recepción?', a: 'Solo lo que compartas. Un enlace nombra una calificación; comparte la final.' },
        { q: '¿Califica laptops?', a: 'Sí: teléfonos, tabletas, laptops (tapa, base, teclado, pantalla y bordes) y relojes inteligentes.' }
      ],
      close: { h: 'Califica tu próxima recepción.', p: 'Regístrate y ve los hallazgos que dirigen el trabajo.' }
    }
  },

  marketplaces: {
    example: 'share',
    en: {
      kicker: 'Autograding for marketplaces and auctions',
      h1: ['Give buyers condition evidence,', 'not only a grade label.'],
      intro: 'A listing that says “Grade B” asks the buyer to trust the seller’s B. A listing with an inphox autograde report shows the grade with what was found on every side and the photos, and a business buyer can read the same device under their own grading standard.',
      cta: { primary: { label: 'Talk about a marketplace integration', to: 'contact' }, secondary: { label: 'Read the share and compare API', to: 'docs', anchor: 'comparing-a-device-across-accounts' } },
      flow: { k: 'Where it fits', h: 'From the seller’s photos to the buyer’s decision.', steps: [
        ['Seller photographs', 'In your listing flow, through the API, one photo per side.'],
        ['Graded on your standard', 'Your marketplace’s profile, so every listing uses the same scale.'],
        ['Report on the listing', 'A share link with the grade, findings and photos, with an expiry you choose.'],
        ['Buyer reads it their way', 'With an account, a buyer can compare it under their own standard.']
      ] },
      sections: [
        { k: '01', h: 'One scale for every seller', p: 'When each seller grades with their own words, buyers learn to discount every grade. Grade every listing with one marketplace profile through the API and the label means the same thing on every listing, with the version that made it named on the result.' },
        { k: '02', h: 'Evidence on the listing', p: 'A share link opens a page with the grade, what was seen on each side and the photos. Links last from an hour to 30 days, up to 20 live links per device, and the owner can turn one off at any time. Grades made with zero retention can be compared but have no public page.' },
        { k: '03', h: 'Business buyers keep their own grade', p: 'Wholesale and trade buyers often have their own standard. With the link and their own account, they read the same inspection under their standard and see their grade and score, without seeing the seller’s rules. Comparing is free.' },
        { k: '04', h: 'Disputes start from the same record', p: 'When a buyer says the device arrived worse than listed, both sides can look at the same photos and findings. It does not settle the dispute for you, and it cannot show what the photos did not: it gives the conversation a starting point.' },
        { k: '05', h: 'Inside your listing flow', p: 'Create the grade as a draft while the seller is still listing. If a photo cannot be judged, that side reopens with the reason, so your flow can ask the seller for a better photo before the listing goes live, and the refused side is refunded. When the grade completes, a signed webhook tells your platform to attach the report.', list: ['draft: true, then submit', 'grade.needs_retake: ask the seller again', 'grade.completed: attach the report'] }
      ],
      example: { k: 'Example', h: 'What a buyer sees on the link.', note: 'Illustrative example of a shared report, using the documented example result from our API docs.',
        share: { grade: 'B', standard: 'inphox Standard', sides: [['Front', 'A', 'Light scratches on the glass'], ['Back', 'B', 'Noticeable wear on the housing']], expires: 'Link expires in 7 days', action: 'Read it under your own standard' } },
      fit: { k: 'Boundaries', h: 'Evidence for buyers, not a guarantee.',
        does: ['A consistent cosmetic grade across sellers on one marketplace profile.', 'Share links with findings and photos, with expiry and revoke.', 'Cross-account compare for buyers with their own standard.'],
        doesnt: ['It cannot prove the photos show the unit shipped.', 'No functional, IMEI or blacklist checks.', 'It does not resolve disputes or set prices.'] },
      evaluate: { k: 'Evaluate', h: 'Pilot it on one category.', steps: ['Pick one category, such as used iPhones, and a handful of willing sellers.', 'Grade their listings through the API on one marketplace profile and attach the link.', 'Watch the questions buyers ask and the returns you see, compared with listings without a report.'] },
      faq: [
        { q: 'Do sellers need inphox accounts?', a: 'Not necessarily. Your platform can grade through its own API key on behalf of sellers, with each seller as a label or external_id.' },
        { q: 'Can we show the report inside our own page?', a: 'Yes: fetch the result through the API and display it yourself, or link to the share page.' },
        { q: 'Does it reduce returns?', a: 'We have not measured that on any marketplace yet. A category pilot is how to find out.' }
      ],
      close: { h: 'Put evidence on your listings.', p: 'Tell us your categories and volume, and we will plan a pilot.' }
    },
    es: {
      kicker: 'Autograding para marketplaces y subastas',
      h1: ['Da a los compradores evidencia del estado,', 'no solo una etiqueta.'],
      intro: 'Una publicación que dice “Calificación B” le pide al comprador confiar en la B del vendedor. Una publicación con un reporte de inphox autograde muestra la calificación con lo que se encontró en cada lado y las fotos, y un comprador empresarial puede leer el mismo dispositivo con su propio estándar.',
      cta: { primary: { label: 'Habla de una integración para marketplace', to: 'contact' }, secondary: { label: 'Lee la API de compartir y comparar', to: 'docs', anchor: 'comparing-a-device-across-accounts' } },
      flow: { k: 'Dónde encaja', h: 'De las fotos del vendedor a la decisión del comprador.', steps: [
        ['El vendedor fotografía', 'En tu flujo de publicación, por la API, una foto por lado.'],
        ['Calificado con tu estándar', 'El perfil de tu marketplace, para que todas las publicaciones usen la misma escala.'],
        ['Reporte en la publicación', 'Un enlace con la calificación, los hallazgos y las fotos, con la vigencia que elijas.'],
        ['El comprador lo lee a su manera', 'Con una cuenta, un comprador puede compararlo con su propio estándar.']
      ] },
      sections: [
        { k: '01', h: 'Una escala para todos los vendedores', p: 'Cuando cada vendedor califica con sus propias palabras, los compradores aprenden a desconfiar de todas las calificaciones. Califica cada publicación con un solo perfil del marketplace por la API y la etiqueta significa lo mismo en todas, con la versión que la produjo nombrada en el resultado.' },
        { k: '02', h: 'Evidencia en la publicación', p: 'Un enlace compartido abre una página con la calificación, lo que se vio en cada lado y las fotos. Los enlaces duran de una hora a 30 días, hasta 20 enlaces activos por dispositivo, y el dueño puede desactivar uno cuando quiera. Las calificaciones hechas con retención cero se pueden comparar pero no tienen página pública.' },
        { k: '03', h: 'Los compradores empresariales conservan su calificación', p: 'Los compradores mayoristas y comerciales suelen tener su propio estándar. Con el enlace y su propia cuenta, leen la misma inspección con su estándar y ven su calificación y puntuación, sin ver las reglas del vendedor. Comparar es gratis.' },
        { k: '04', h: 'Las disputas parten del mismo registro', p: 'Cuando un comprador dice que el dispositivo llegó peor de lo publicado, ambas partes pueden revisar las mismas fotos y hallazgos. No resuelve la disputa por ti y no puede mostrar lo que las fotos no muestran: le da a la conversación un punto de partida.' },
        { k: '05', h: 'Dentro de tu flujo de publicación', p: 'Crea la calificación como borrador mientras el vendedor publica. Si una foto no se puede juzgar, ese lado se reabre con el motivo, así tu flujo puede pedir una mejor foto antes de que la publicación salga, y el lado rechazado se reembolsa. Cuando la calificación termina, un webhook firmado avisa a tu plataforma para adjuntar el reporte.', list: ['draft: true y después submit', 'grade.needs_retake: pide la foto otra vez', 'grade.completed: adjunta el reporte'] }
      ],
      example: { k: 'Ejemplo', h: 'Lo que ve un comprador en el enlace.', note: 'Ejemplo ilustrativo de un reporte compartido, con el resultado de ejemplo documentado en nuestra API.',
        share: { grade: 'B', standard: 'inphox Standard', sides: [['Frente', 'A', 'Rayones leves en el vidrio'], ['Reverso', 'B', 'Desgaste notable en la carcasa']], expires: 'El enlace vence en 7 días', action: 'Léelo con tu propio estándar' } },
      fit: { k: 'Alcance', h: 'Evidencia para compradores, no una garantía.',
        does: ['Una calificación estética constante entre vendedores con un perfil del marketplace.', 'Enlaces con hallazgos y fotos, con vigencia y revocación.', 'Comparación entre cuentas para compradores con su propio estándar.'],
        doesnt: ['No puede probar que las fotos muestran la unidad enviada.', 'No hace revisiones funcionales, de IMEI ni de lista negra.', 'No resuelve disputas ni fija precios.'] },
      evaluate: { k: 'Evaluación', h: 'Haz una prueba en una categoría.', steps: ['Elige una categoría, como iPhones usados, y algunos vendedores dispuestos.', 'Califica sus publicaciones por la API con un perfil del marketplace y adjunta el enlace.', 'Observa las preguntas de los compradores y las devoluciones, frente a publicaciones sin reporte.'] },
      faq: [
        { q: '¿Los vendedores necesitan cuenta de inphox?', a: 'No necesariamente. Tu plataforma puede calificar con su propia clave de API en nombre de los vendedores, con cada vendedor como etiqueta o external_id.' },
        { q: '¿Podemos mostrar el reporte dentro de nuestra página?', a: 'Sí: obtén el resultado por la API y muéstralo tú, o enlaza a la página compartida.' },
        { q: '¿Reduce las devoluciones?', a: 'Aún no lo hemos medido en ningún marketplace. Una prueba por categoría es la forma de averiguarlo.' }
      ],
      close: { h: 'Pon evidencia en tus publicaciones.', p: 'Cuéntanos tus categorías y volumen, y planeamos una prueba.' }
    }
  }
};

// The API example is code: the Spanish page shows the same request and response.
INDUSTRIES.api.es.example.request = INDUSTRIES.api.en.example.request;
INDUSTRIES.api.es.example.response = INDUSTRIES.api.en.example.response;
