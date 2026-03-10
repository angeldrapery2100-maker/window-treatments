'use client'

import { useEffect, useRef } from 'react'

const LAT  = 34.10985
const LNG  = -118.06089
const ZOOM = 15

export default function FlatMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    // ── Inject Leaflet CSS ──
    if (!document.getElementById('leaflet-css')) {
      const link  = document.createElement('link')
      link.id     = 'leaflet-css'
      link.rel    = 'stylesheet'
      link.href   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // ── Inject Leaflet JS then initialise ──
    const initMap = () => {
      const L = (window as any).L
      if (!L || !containerRef.current) return

      const map = L.map(containerRef.current, {
        center:          [LAT, LNG],
        zoom:            ZOOM,
        zoomControl:     false,
        scrollWheelZoom: false,
        dragging:        true,
        attributionControl: false,
      })
      mapRef.current = map

      // CartoDB Positron — pure white roads, no POI clutter
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19 }
      ).addTo(map)

      // Minimal custom SVG marker
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:14px; height:14px;
          background:#12141C; border-radius:50%;
          border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
        "></div>`,
        iconSize:   [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker([LAT, LNG], { icon }).addTo(map)

      // Attribution — tiny, bottom-right
      L.control.attribution({ prefix: false, position: 'bottomright' })
        .addAttribution('© <a href="https://carto.com" target="_blank">CARTO</a>')
        .addTo(map)
    }

    if ((window as any).L) {
      initMap()
    } else {
      const script    = document.createElement('script')
      script.src      = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload   = initMap
      document.head.appendChild(script)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-[320px] md:h-[400px]"
      style={{ background: '#f5f5f5' }}
    />
  )
}
