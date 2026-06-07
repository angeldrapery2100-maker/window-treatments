// schema.org Product + BreadcrumbList structured data for product detail pages.
// Helps Google show rich results (product name, image, breadcrumb) for
// /products/[slug]. Additive only — emitted as <script type="application/ld+json">.

const SITE = 'https://angel-drapery.com'

function stripHtml(s?: string): string {
  return (s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function buildProductJsonLd(opts: {
  name: string
  description?: string
  image?: string
  slug: string
  brand?: string
}) {
  const ld: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    url: `${SITE}/products/${opts.slug}`,
  }
  const desc = stripHtml(opts.description)
  if (desc) ld.description = desc.slice(0, 500)
  if (opts.image) ld.image = opts.image
  if (opts.brand) ld.brand = { '@type': 'Brand', name: opts.brand }
  return ld
}

export function buildBreadcrumbJsonLd(name: string, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Products', item: `${SITE}/products` },
      { '@type': 'ListItem', position: 2, name, item: `${SITE}/products/${slug}` },
    ],
  }
}
