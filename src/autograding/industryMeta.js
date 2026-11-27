// inphox Autograding by industry: one entry per industry, its address and how search shows it, in English and
// Spanish. src/routes.js builds the routes from this list (so the sitemap, canonical, hreflang and seo-check follow it);
// the page copy itself lives in industries.js, a separate chunk only these pages download.
// Add an industry only with content that is genuinely its own (Google's scaled-content policy): the test
// tests/industries.test.js fails when two pages read too much alike.
export const INDUSTRY_META = [
  {
    slug: 'buyback',
    en: { nav: 'Buyback and trade-in', blurb: 'See the condition before the device ships to you.',
      title: 'Photo condition grading for buyback and trade-in | inphox',
      description: 'Grade a trade-in from photos before it ships: a score, a grade and the visible damage behind it, on your own standard, to compare with what receiving finds.' },
    es: { nav: 'Recompra y canje', blurb: 'Conoce el estado antes de que el dispositivo te llegue.',
      title: 'Evaluación estética por fotos para recompra y canje | inphox',
      description: 'Califica un canje con fotos antes del envío: puntuación, calificación y el daño visible, con tu propio estándar, para compararlo con lo que encuentra recepción.' }
  },
  {
    slug: 'itad',
    en: { nav: 'ITAD and asset recovery', blurb: 'Documented cosmetic grades inside the workflow you already run.',
      title: 'Cosmetic grading for ITAD and asset recovery | inphox',
      description: 'Photo-based cosmetic grading for ITAD: your asset IDs on every result, batches with CSV export, your grading standard, and an API into the systems you use.' },
    es: { nav: 'ITAD y recuperación de activos', blurb: 'Calificaciones estéticas documentadas dentro de tu proceso actual.',
      title: 'Evaluación estética para ITAD y recuperación de activos | inphox',
      description: 'Evaluación estética por fotos para ITAD: tus ID de activo en cada resultado, lotes con exportación CSV, tu estándar y una API hacia tus sistemas actuales.' }
  },
  {
    slug: 'repair-shops',
    en: { nav: 'Repair shops', blurb: 'Grade a device from your phone. Pay per device, no contract.',
      title: 'Simple cosmetic grading for repair shops | inphox',
      description: 'Grade a used phone, tablet, laptop or watch from photos taken with your own phone. Prepaid per device, no contract, no new hardware, a report to show customers.' },
    es: { nav: 'Talleres de reparación', blurb: 'Califica con tu teléfono. Pagas por dispositivo, sin contrato.',
      title: 'Evaluación estética sencilla para talleres | inphox',
      description: 'Califica un teléfono, tableta, laptop o reloj usado con fotos de tu propio teléfono. Prepago por dispositivo, sin contrato ni equipo nuevo, con reporte para el cliente.' }
  },
  {
    slug: 'api',
    en: { nav: 'Developers and API', blurb: 'Cosmetic grading in your own software, through an open API.',
      title: 'Cosmetic device grading API for phones and laptops | inphox',
      description: 'A REST API for cosmetic grading of phones, tablets, laptops and watches: photos in; score, grade and findings out. Webhooks, idempotency, batches and profiles.' },
    es: { nav: 'Desarrolladores y API', blurb: 'Evaluación estética en tu propio software, con una API abierta.',
      title: 'API de evaluación estética de dispositivos | inphox',
      description: 'API REST de evaluación estética para teléfonos, tabletas, laptops y relojes: fotos de entrada; puntuación, calificación y hallazgos. Webhooks, lotes y perfiles.' }
  },
  {
    slug: 'wholesale',
    en: { nav: 'Wholesale and liquidation', blurb: 'Read a supplier’s grade under your own buying standard.',
      title: 'Grade wholesale device lots on your own standard | inphox',
      description: 'Compare a supplier’s grade with your own buying standard before a lot changes hands: batch grading from photos, and a shared link read on your own scale.' },
    es: { nav: 'Mayoreo y liquidación', blurb: 'Lee la calificación del proveedor con tu propio estándar.',
      title: 'Califica lotes de mayoreo con tu propio estándar | inphox',
      description: 'Compara la calificación de un proveedor con tu estándar de compra antes de cerrar un lote: calificación por lotes con fotos y un enlace leído con tu escala.' }
  },
  {
    slug: 'refurbishers',
    en: { nav: 'Refurbishers and remarketers', blurb: 'Document condition at intake, after the work, and at sale.',
      title: 'Cosmetic grading for refurbishers and remarketers | inphox',
      description: 'Grade a device at intake, after refurbishment and before resale, under one reference. Each grade keeps its photos, findings and the standard version behind it.' },
    es: { nav: 'Reacondicionadores y revendedores', blurb: 'Documenta el estado al recibir, tras el trabajo y al vender.',
      title: 'Evaluación estética para reacondicionadores | inphox',
      description: 'Califica un dispositivo al recibirlo, tras reacondicionarlo y antes de venderlo, con una referencia. Cada calificación guarda fotos, hallazgos y versión del estándar.' }
  },
  {
    slug: 'marketplaces',
    en: { nav: 'Marketplaces and auctions', blurb: 'Give buyers condition evidence, not only a grade label.',
      title: 'Photo condition reports for device marketplaces | inphox',
      description: 'Attach a photo-based condition report to a listing: grade, score and findings for every side. Buyers can read the same device under their own grading standard.' },
    es: { nav: 'Marketplaces y subastas', blurb: 'Da a los compradores evidencia del estado, no solo una etiqueta.',
      title: 'Reportes de estado por fotos para marketplaces | inphox',
      description: 'Adjunta a una publicación un reporte de estado por fotos: calificación y hallazgos de cada lado. El comprador puede leer el mismo equipo con su propio estándar.' }
  }
].map(m => ({ ...m, page: 'ag-' + m.slug, path: '/autograding/' + m.slug }));

export const INDUSTRY_PAGES = INDUSTRY_META.map(m => m.page);
export const isIndustryPage = page => INDUSTRY_PAGES.includes(page);
export const industryMeta = page => INDUSTRY_META.find(m => m.page === page) || null;
