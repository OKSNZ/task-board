import { useEffect, useState } from 'react'

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

export default function BattleAnimation({ battle, onDismiss }) {
  const [phase, setPhase] = useState('appear')
  const [currentBattle, setCurrentBattle] = useState(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!battle) {
      setCurrentBattle(null)
      return
    }

    setCurrentBattle(battle)
    setPhase('appear')

    const flashTimer = setTimeout(() => setPhase('flash'), 800)
    const victoryTimer = setTimeout(() => setPhase('victory'), 1200)
    const dismissTimer = setTimeout(() => {
      onDismiss()
    }, 2500)

    return () => {
      clearTimeout(flashTimer)
      clearTimeout(victoryTimer)
      clearTimeout(dismissTimer)
    }
  }, [battle, onDismiss])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!currentBattle) return null

  const spriteUrl = `${SPRITE_BASE}/${currentBattle.pokemonId}.png`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-label="Battle animation"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Flash effect */}
      {phase === 'flash' && <div className="absolute inset-0 battle-flash" />}

      {/* Battle arena */}
      <div className="relative z-10 text-center battle-slide-in">
        {/* Enemy silhouette / sprite */}
        <div className="mb-4">
          <img
            src={spriteUrl}
            alt=""
            className="w-24 h-24 mx-auto"
            style={{
              imageRendering: 'pixelated',
              filter: phase === 'appear' ? 'brightness(0)' : 'none',
              transition: 'filter 0.3s ease',
            }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>

        {/* Text */}
        {phase === 'appear' && (
          <p className="font-pixel text-white text-[10px] sm:text-xs leading-relaxed">
            Wild {currentBattle.taskText} appeared!
          </p>
        )}

        {(phase === 'flash' || phase === 'victory') && (
          <div>
            <p className="font-pixel text-green-400 text-[10px] sm:text-xs mb-2 leading-relaxed">
              You defeated it!
            </p>
            <p className="font-pixel text-poke-yellow text-sm leading-relaxed">
              +{currentBattle.xpGained} XP!
            </p>

            {/* XP bar */}
            <div className="mt-4 mx-auto w-48 h-3 rounded bg-gray-800 border border-gray-600 overflow-hidden">
              <div className="h-full bg-poke-yellow rounded battle-xp-fill" style={{ width: 0 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
