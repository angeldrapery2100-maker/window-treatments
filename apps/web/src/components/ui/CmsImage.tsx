'use client'

/**
 * CmsImage — renders an image from CMS with admin-configurable size & fit.
 * Falls back to a placeholder if no image URL is set.
 */
export function CmsImage({
  url,
  alt = '',
  width,
  height,
  fit = 'cover',
  className = '',
  placeholder = '',
}: {
  url?: string
  alt?: string
  width?: number
  height?: number
  fit?: string
  className?: string
  placeholder?: string
}) {
  if (!url) {
    return (
      <div
        className={`bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center ${className}`}
      >
        <span className="text-gray-400 text-lg">{placeholder || alt || 'Image'}</span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={{
        objectFit: (fit as any) || 'cover',
        ...(width ? { maxWidth: width } : {}),
        ...(height ? { maxHeight: height } : {}),
      }}
    />
  )
}
