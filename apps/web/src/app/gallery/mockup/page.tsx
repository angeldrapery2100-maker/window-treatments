import Link from 'next/link'
import { DEFAULT_VIDEOS } from '@/lib/gallery-videos-data'

const featured = DEFAULT_VIDEOS[0]
const portraits = DEFAULT_VIDEOS.filter(item => item.orientation === 'portrait').slice(0, 4)
const landscapes = DEFAULT_VIDEOS.filter(item => item.orientation === 'landscape').slice(1, 6)

function EditorialCard({
  title,
  location,
  tag,
  poster,
  aspect,
  emphasis = 'standard',
}: {
  title: string
  location: string
  tag: string
  poster: string
  aspect: string
  emphasis?: 'standard' | 'quiet' | 'feature'
}) {
  const titleClass =
    emphasis === 'feature'
      ? 'text-2xl md:text-3xl'
      : emphasis === 'quiet'
        ? 'text-base md:text-lg'
        : 'text-lg md:text-xl'

  return (
    <article className="group">
      <div className="overflow-hidden rounded-[28px] bg-[#d9d0c4]">
        <div className="relative" style={{ aspectRatio: aspect }}>
          <img
            src={poster}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
          <span className="absolute left-5 top-5 rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/80 backdrop-blur-md">
            {tag}
          </span>
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
            <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/65">{location}</p>
            <h3 className={`${titleClass} max-w-[16ch] font-light tracking-[-0.03em] text-white`}>
              {title}
            </h3>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function GalleryMockupPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#201d1a]">
      <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_top_left,_rgba(187,155,110,0.22),_transparent_42%),linear-gradient(180deg,_#f7f2eb_0%,_#f5f0e8_65%)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-[1560px] items-center justify-between px-6 pb-10 pt-8 md:px-10">
        <Link href="/" className="text-[15px] font-medium uppercase tracking-[0.38em] text-[#28231d]">
          Angel Drapery, Inc
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {[
            ['About', '/about'],
            ['Projects', '/gallery'],
            ['Products', '/products'],
            ['Store', '/store'],
            ['Contact', '/#contact'],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className={`text-[12px] uppercase tracking-[0.26em] transition ${
                label === 'Projects' ? 'text-[#201d1a]' : 'text-[#6f675f] hover:text-[#201d1a]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1560px] gap-8 px-6 pb-20 md:grid-cols-[1.15fr_0.85fr] md:px-10">
        <div className="space-y-10 pt-4 md:pt-12">
          <div className="space-y-5">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#8b755d]">Editorial Prototype</p>
            <h1 className="max-w-[10ch] text-6xl font-light leading-[0.93] tracking-[-0.06em] md:text-[7.7rem]">
              Handcrafted
              <span className="ml-3 font-serif italic text-[#8c7a67]">Stories</span>
            </h1>
            <div className="flex max-w-[720px] flex-col gap-4 border-l border-[#cbbcab] pl-5 text-[15px] leading-7 text-[#5b534c] md:flex-row md:items-end md:justify-between">
              <p className="max-w-[32ch]">
                A quieter, more editorial gallery direction for Angel Drapery. The emphasis is on
                atmosphere, hierarchy, and project framing rather than a flat video index.
              </p>
              <div className="text-[11px] uppercase tracking-[0.3em] text-[#8b837a]">
                24 Projects
                <br />
                Temple City, CA
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[28px] border border-[#d7cbbb] bg-white/70 p-6 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#8c7a67]">Curated Focus</p>
              <div className="mt-8 space-y-7">
                <div>
                  <p className="text-4xl font-light tracking-[-0.05em]">01</p>
                  <p className="mt-1 text-sm uppercase tracking-[0.28em] text-[#8c7a67]">Featured Residence</p>
                </div>
                <p className="max-w-[24ch] text-sm leading-7 text-[#5b534c]">
                  Overscaled opening image, quieter navigation, and staggered project blocks to make
                  the gallery feel like a premium interior portfolio rather than a generic media grid.
                </p>
                <div className="space-y-3 border-t border-[#e7ddd0] pt-5 text-sm text-[#6d6258]">
                  <div className="flex items-center justify-between">
                    <span>Visual Tone</span>
                    <span className="uppercase tracking-[0.2em] text-[#201d1a]">Warm Minimal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Layout Rhythm</span>
                    <span className="uppercase tracking-[0.2em] text-[#201d1a]">Editorial Mix</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Primary CTA</span>
                    <span className="uppercase tracking-[0.2em] text-[#201d1a]">Consultation</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[34px] bg-[#181512] p-3 shadow-[0_45px_100px_rgba(61,44,23,0.18)]">
              <EditorialCard
                title={featured.title}
                location={featured.location}
                tag={featured.tag}
                poster={featured.poster}
                aspect="1.56 / 1"
                emphasis="feature"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 pt-2 md:grid-rows-[auto_auto_1fr] md:pt-24">
          <div className="rounded-[28px] border border-[#ddcfbf] bg-[#faf6f0] p-6">
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#8c7a67]">Design Notes</p>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {[
                ['Less chrome', 'Strip the current pill-heavy nav and keep the frame quieter.'],
                ['Bigger hero', 'Lead with one dominant project before showing the archive.'],
                ['Mixed cadence', 'Alternate portrait, landscape, and detail blocks to create rhythm.'],
              ].map(([title, copy]) => (
                <div key={title} className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.24em] text-[#201d1a]">{title}</p>
                  <p className="text-sm leading-6 text-[#665d55]">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {portraits.slice(0, 2).map((item, index) => (
              <EditorialCard
                key={item.id}
                title={item.title}
                location={item.location}
                tag={item.tag}
                poster={item.poster}
                aspect="0.8 / 1"
                emphasis={index === 0 ? 'standard' : 'quiet'}
              />
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-5">
              {landscapes.slice(0, 2).map(item => (
                <EditorialCard
                  key={item.id}
                  title={item.title}
                  location={item.location}
                  tag={item.tag}
                  poster={item.poster}
                  aspect="1.58 / 1"
                />
              ))}
            </div>
            <div className="grid gap-5">
              {portraits.slice(2, 4).map(item => (
                <EditorialCard
                  key={item.id}
                  title={item.title}
                  location={item.location}
                  tag={item.tag}
                  poster={item.poster}
                  aspect="0.78 / 1"
                  emphasis="quiet"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1560px] px-6 pb-24 md:px-10">
        <div className="grid gap-6 rounded-[34px] bg-[#221d18] px-7 py-8 text-white md:grid-cols-[0.9fr_1.1fr_0.75fr] md:px-10 md:py-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">Project Index</p>
            <h2 className="mt-4 text-3xl font-light tracking-[-0.04em] md:text-4xl">
              A gallery that feels like a private lookbook.
            </h2>
          </div>
          <div className="grid gap-3 text-sm leading-7 text-white/65">
            <p>
              The next step would be adding subtle category chips, keyboard navigation in the
              lightbox, and a cinematic full-screen project viewer.
            </p>
            <p>
              This preview keeps your existing media but changes the visual hierarchy so the brand
              reads more intentional and expensive.
            </p>
          </div>
          <div className="flex flex-col justify-between gap-4 md:items-end">
            <Link
              href="/gallery"
              className="inline-flex items-center rounded-full border border-white/15 px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Back to Current Page
            </Link>
            <p className="text-right text-[11px] uppercase tracking-[0.22em] text-white/35">
              Preview Route
              <br />
              /gallery/mockup
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
