/**
 * Layout Factory - dynamically loads the correct layout for each product.
 * Returns a unified ProductLayout interface regardless of source format.
 */
import type { ProductLayout } from './types'

// Static layout imports (existing completed products)
import { applauseLayout } from './applause-layout'
import { silhouetteLayout } from './silhouette-layout'
import { pirouetteLayout } from './pirouette-layout'
import { luminetteLayout } from './luminette-layout'
import { vignetteLayout } from './vignette-layout'
import { provenanceLayout } from './provenance-layout'
import { alustraArchLayout } from './alustra-arch-layout'
import { sonnetteLayout } from './sonnette-layout'
import { buildDuetteLayout } from './duette-layout'

// New product layout imports
import { ariaLayout } from './aria-layout'
import { nantucketLayout } from './nantucket-layout'
import { palmBeachLayout } from './palm-beach-layout'
import { everwoodParklandLayout } from './everwood-parkland-layout'
import { heritanceNewstyleLayout } from './heritance-newstyle-layout'
import { modernPreciousMetalsLayout } from './modern-precious-metals-layout'
import { rollerSkylineLayout } from './roller-skyline-layout'
import { screenSkylineLayout } from './screen-skyline-layout'
import { verticalBlindsLayout } from './vertical-blinds-layout'
import { usBandedLayout } from './us-banded-layout'
import { alustraWovenLayout } from './alustra-woven-layout'

/**
 * Load layout for a given product slug.
 * @param slug - Product URL slug
 * @param product - Raw product JSON (needed for Duette-style dynamic layouts)
 */
export function loadLayout(slug: string, product: any): ProductLayout | null {
  switch (slug) {
    case 'applause':
      return applauseLayout as unknown as ProductLayout
    case 'silhouette':
      return silhouetteLayout as unknown as ProductLayout
    case 'pirouette':
      return pirouetteLayout as unknown as ProductLayout
    case 'luminette':
      return luminetteLayout as unknown as ProductLayout
    case 'duette':
      return buildDuetteLayout(product) as unknown as ProductLayout
    case 'vignette':
      return vignetteLayout as unknown as ProductLayout
    case 'provenance':
      return provenanceLayout as unknown as ProductLayout
    case 'alustra-architectural':
      return alustraArchLayout as unknown as ProductLayout
    case 'sonnette':
      return sonnetteLayout as unknown as ProductLayout
    case 'aria':
      return ariaLayout as unknown as ProductLayout
    case 'nantucket':
      return nantucketLayout as unknown as ProductLayout
    case 'palm-beach':
      return palmBeachLayout as unknown as ProductLayout
    case 'everwood-parkland':
      return everwoodParklandLayout as unknown as ProductLayout
    case 'heritance-newstyle':
      return heritanceNewstyleLayout as unknown as ProductLayout
    case 'modern-precious-metals':
      return modernPreciousMetalsLayout as unknown as ProductLayout
    case 'roller-skyline':
      return rollerSkylineLayout as unknown as ProductLayout
    case 'screen-skyline':
      return screenSkylineLayout as unknown as ProductLayout
    case 'verticals':
      return verticalBlindsLayout as unknown as ProductLayout
    case 'us-banded':
      return usBandedLayout as unknown as ProductLayout
    case 'alustra-woven-textures':
      return alustraWovenLayout as unknown as ProductLayout

    default:
      return null
  }
}
