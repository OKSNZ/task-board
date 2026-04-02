import { useEffect } from 'react'

export default function BattleTransition({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className="absolute inset-0 z-40 pointer-events-none battle-transition-anim"
      aria-hidden="true"
    />
  )
}
