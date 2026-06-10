'use client'

import { LazyMotion, domAnimation } from 'framer-motion'

// App-wide LazyMotion provider. Components use the lightweight `m` component
// (imported as `m as motion`, so JSX stays unchanged) and the animation
// features load from this single shared bundle (~15KB) instead of every
// page bundling the full `motion` runtime (~34KB).
// NOTE: domAnimation covers animate/exit/whileHover/whileTap/whileInView.
// If a component ever needs drag or layout animations, switch to domMax.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>
}
