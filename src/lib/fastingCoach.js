const PROOF = {
  solid: { label: 'Solide', tone: 'high' },
  probable: { label: 'Probable', tone: 'medium' },
  caution: { label: 'Prudence', tone: 'low' },
}

const COACH_BANDS = [
  {
    id: 'steady',
    minHours: 0,
    maxHours: 8,
    proof: PROOF.solid,
    headline: 'Hydrate-toi et garde ça simple.',
    summary: 'Au début du jeûne, les conseils les plus robustes sont l’eau, le calme et un mouvement léger.',
    actions: [
      {
        title: 'Hydratation',
        text: 'Bois de l’eau régulièrement. Pendant un jeûne simple, l’eau reste le conseil le plus robuste et le plus utile.',
      },
      {
        title: 'Mouvement léger',
        text: 'Une marche courte ou un peu de mobilité convient bien. Pas besoin de surinterpréter chaque sensation.',
      },
      {
        title: 'Boissons simples',
        text: 'Si tu les tolères bien, eau, café noir ou thé non sucré sont les options les plus classiques pendant le jeûne.',
      },
    ],
    safety: [],
  },
  {
    id: 'focus',
    minHours: 8,
    maxHours: 16,
    proof: PROOF.solid,
    headline: 'Hydrate-toi d’abord, puis observe ton énergie.',
    summary: 'Dans cette fenêtre, l’hydratation et l’écoute de l’énergie réelle sont plus fiables que les interprétations héroïques.',
    actions: [
      {
        title: 'Hydratation',
        text: 'Si tu crois avoir faim, commence par boire de l’eau et attends quelques minutes avant de conclure.',
      },
      {
        title: 'Effort modéré',
        text: 'Si tu es habitué au jeûne, un effort modéré peut convenir. Évitez l’intense si l’énergie baisse ou si tu te sens instable.',
      },
      {
        title: 'Fenêtre de clarté',
        text: 'Bon moment pour du travail concentré si tu te sens bien, mais sans te forcer à performer à tout prix.',
      },
    ],
    safety: [],
  },
  {
    id: 'light',
    minHours: 16,
    maxHours: 24,
    proof: PROOF.probable,
    headline: 'Hydratation prioritaire, activité plus légère.',
    summary: 'Quand le jeûne avance, mieux vaut privilégier des recommandations prudentes et faciles à tenir.',
    actions: [
      {
        title: 'Hydratation',
        text: 'Continue de boire régulièrement. Si tu as chaud, que tu transpires ou qu’il fait très sec, sois encore plus attentif à l’eau.',
      },
      {
        title: 'Bouger léger',
        text: 'Privilégie marche, mobilité ou effort léger. Évite l’intense si tu n’es pas clairement en forme.',
      },
      {
        title: 'Écoute des signaux',
        text: 'Une baisse nette d’énergie est un signal pour ralentir, pas pour te prouver quelque chose.',
      },
    ],
    safety: [
      'Si tu ressens vertiges persistants, palpitations, confusion ou malaise, arrête le jeûne.',
    ],
  },
  {
    id: 'caution',
    minHours: 24,
    maxHours: Number.POSITIVE_INFINITY,
    proof: PROOF.caution,
    headline: 'Prudence : à ce stade, la sécurité prime sur l’optimisation.',
    summary: 'Au-delà de 24 h, la variabilité individuelle augmente. L’app doit surtout te ramener vers des repères de sécurité.',
    actions: [
      {
        title: 'Hydratation et repos',
        text: 'Hydrate-toi, réduis l’intensité et privilégie le repos ou la marche douce plutôt qu’un entraînement ambitieux.',
      },
      {
        title: 'Pas d’héroïsme',
        text: 'N’interprète pas les sensations fortes comme un signe de progrès. À ce stade, la prudence est plus utile que la volonté brute.',
      },
      {
        title: 'Contexte médical',
        text: 'Si tu as une condition médicale, prends des médicaments ou improvises un jeûne long, l’avis d’un professionnel devient important.',
      },
    ],
    safety: [
      'Vertiges, confusion, palpitations, faiblesse marquée ou malaise : mets fin au jeûne.',
      'Jeûnes prolongés, diabète, grossesse ou médication : un avis médical ou professionnel est recommandé.',
    ],
  },
]

export function getCoachBand(hoursElapsed) {
  if (!Number.isFinite(hoursElapsed) || hoursElapsed < 0) return null

  return COACH_BANDS.find((band) => hoursElapsed >= band.minHours && hoursElapsed < band.maxHours) ?? COACH_BANDS[COACH_BANDS.length - 1]
}

export function buildFastingCoach(hoursElapsed) {
  const band = getCoachBand(hoursElapsed)
  if (!band) return null

  return {
    bandId: band.id,
    proof: band.proof,
    headline: band.headline,
    summary: band.summary,
    actions: band.actions,
    safety: band.safety,
  }
}
