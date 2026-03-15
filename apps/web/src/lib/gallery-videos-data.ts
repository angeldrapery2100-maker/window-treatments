// ─────────────────────────────────────────────────────────────────────────────
// Shared gallery video data — importable by both server and client components
// ─────────────────────────────────────────────────────────────────────────────

// In production the .mov files live on R2 (not on Vercel).
// Set NEXT_PUBLIC_VIDEO_CDN to the R2 public URL so videos load from there.
const VIDEO_CDN = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_VIDEO_CDN?.replace(/\/$/, '')) || ''

export interface ProjectVideo {
  id: number
  title: string
  location: string
  tag: string
  description: string
  orientation: 'landscape' | 'portrait'
  video: string
  poster: string
}

export const DEFAULT_VIDEOS: ProjectVideo[] = [
  { id: 1,  orientation: 'landscape', title: 'Custom Drapery',      location: 'Temple City, CA', tag: 'Handcrafted',     description: 'Floor-to-ceiling linen panels, hand-pleated and locally sourced. Integrated with Apple HomeKit for one-touch control.',     video: `${VIDEO_CDN}/videos/projects/landscape-01.mov`, poster: '/videos/projects/posters/landscape-01.jpg' },
  { id: 2,  orientation: 'landscape', title: 'Smart Roller Shades', location: 'Pasadena, CA',    tag: 'Motorized',       description: '"Hey Siri, close the drapery." Motorized roller shades seamlessly paired with the Apple Home ecosystem.',              video: `${VIDEO_CDN}/videos/projects/landscape-02.mov`, poster: '/videos/projects/posters/landscape-02.jpg' },
  { id: 3,  orientation: 'portrait',  title: 'Roman Shades',        location: 'San Marino, CA',  tag: 'Classic',         description: 'Structured fabric folds, tailored to the millimeter.',                                                                   video: `${VIDEO_CDN}/videos/projects/portrait-01.mov`,  poster: '/videos/projects/posters/portrait-01.jpg'  },
  { id: 4,  orientation: 'portrait',  title: 'Sheer Panels',        location: 'Arcadia, CA',     tag: 'Light Filtering', description: 'Gossamer sheers that soften daylight without sacrificing the view.',                                                     video: `${VIDEO_CDN}/videos/projects/portrait-02.mov`,  poster: '/videos/projects/posters/portrait-02.jpg'  },
  { id: 5,  orientation: 'portrait',  title: 'Blackout Drapery',    location: 'Monrovia, CA',    tag: 'Blackout',        description: 'Total darkness, total comfort. Heavyweight blackout lining with silent motorization.',                                  video: `${VIDEO_CDN}/videos/projects/portrait-03.mov`,  poster: '/videos/projects/posters/portrait-03.jpg'  },
  { id: 7,  orientation: 'landscape', title: 'Layered Treatments',  location: 'Arcadia, CA',     tag: 'Layered',         description: 'Sheer under-drape paired with a structured outer panel — depth, texture and precision in every layer.',               video: `${VIDEO_CDN}/videos/projects/landscape-03.mov`, poster: '/videos/projects/posters/landscape-03.jpg' },
  { id: 8,  orientation: 'landscape', title: 'Premium Showcase',    location: 'San Marino, CA',  tag: 'Details',         description: 'A close-up look at our craftsmanship — the stitching, the hardware, the finish.',                                      video: `${VIDEO_CDN}/videos/projects/landscape-04.mov`, poster: '/videos/projects/posters/landscape-04.jpg' },
  { id: 9,  orientation: 'portrait',  title: 'Linen Curtains',      location: 'Temple City, CA', tag: 'Natural Fabric',  description: 'European linen, pre-washed for a relaxed, lived-in elegance.',                                                         video: `${VIDEO_CDN}/videos/projects/portrait-05.mov`,  poster: '/videos/projects/posters/portrait-05.jpg'  },
  { id: 10, orientation: 'portrait',  title: 'Pinch Pleat',         location: 'Monrovia, CA',    tag: 'Traditional',     description: 'The timeless three-finger pleat — a signature of formal drapery excellence.',                                          video: `${VIDEO_CDN}/videos/projects/portrait-06.mov`,  poster: '/videos/projects/posters/portrait-06.jpg'  },
  { id: 11, orientation: 'portrait',  title: 'Sheer Overlay',       location: 'Alhambra, CA',    tag: 'Sheer',           description: 'Voile panels in ivory — weightless in appearance, precise in execution.',                                              video: `${VIDEO_CDN}/videos/projects/portrait-07.mov`,  poster: '/videos/projects/posters/portrait-07.jpg'  },
  { id: 12, orientation: 'portrait',  title: 'Eyelet Curtains',     location: 'Pasadena, CA',    tag: 'Contemporary',    description: 'Brushed-brass grommets on slate linen — modern restraint with enduring appeal.',                                        video: `${VIDEO_CDN}/videos/projects/portrait-08.mov`,  poster: '/videos/projects/posters/portrait-08.jpg'  },
  { id: 13, orientation: 'landscape', title: 'Living Room Reveal',  location: 'Pasadena, CA',    tag: 'Full Installation', description: 'A complete room transformation — before and after a full custom window treatment installation.',                      video: `${VIDEO_CDN}/videos/projects/landscape-05.mov`, poster: '/videos/projects/posters/landscape-05.jpg' },
  { id: 14, orientation: 'landscape', title: 'Workshop Process',    location: 'Temple City, CA', tag: 'Behind the Craft', description: 'Inside our Temple City workshop — where every panel is cut, sewn and finished by hand.',                             video: `${VIDEO_CDN}/videos/projects/landscape-06.mov`, poster: '/videos/projects/posters/landscape-06.jpg' },
  { id: 15, orientation: 'portrait',  title: 'Velvet Drapes',       location: 'Arcadia, CA',     tag: 'Velvet',          description: 'Deep sapphire velvet with hand-stitched leading edges — luxury materiality.',                                          video: `${VIDEO_CDN}/videos/projects/portrait-09.mov`,  poster: '/videos/projects/posters/portrait-09.jpg'  },
  { id: 16, orientation: 'landscape', title: 'Before & After',      location: 'San Gabriel, CA', tag: 'Transformation',  description: 'The difference a day makes. Full room transformation completed in a single visit.',                                    video: `${VIDEO_CDN}/videos/projects/landscape-07.mov`, poster: '/videos/projects/posters/landscape-07.jpg' },
]
