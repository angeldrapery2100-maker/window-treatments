// Service-area city registry. Used for cross-links ("Also serving"),
// the /service-areas index, and the sitemap. Keep slugs in sync with
// the static folders under src/app/service-areas/.

export interface City {
  slug: string
  name: string
  /** One-line blurb for the index page — unique per city. */
  blurb: string
}

export const CITIES: City[] = [
  {
    slug: 'temple-city',
    name: 'Temple City',
    blurb: 'Our hometown — the workroom and showroom on Las Tunas Drive have served these streets since 1984.',
  },
  {
    slug: 'arcadia',
    name: 'Arcadia',
    blurb: 'Wide sliding doors and bright new construction call for motorized blackout and oversized treatments.',
  },
  {
    slug: 'san-marino',
    name: 'San Marino',
    blurb: 'Traditional pleated drapery and careful, preservation-minded installation for historic estates.',
  },
  {
    slug: 'pasadena',
    name: 'Pasadena',
    blurb: 'From craftsman bungalows to new condos — treatments tailored to very different windows.',
  },
  {
    slug: 'san-gabriel',
    name: 'San Gabriel',
    blurb: 'Practical, durable window treatments for busy family households and multi-generational homes.',
  },
  {
    slug: 'alhambra',
    name: 'Alhambra',
    blurb: 'Light control and privacy solutions for townhomes and condos on lively streets.',
  },
]
