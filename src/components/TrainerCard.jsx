import XPBar from './XPBar'

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

export default function TrainerCard({ level, xpInLevel, xpToNextLevel, totalXP, streak, battleCry, trainerPokemon, isEvolving }) {
  const spriteUrl = trainerPokemon ? `${SPRITE_BASE}/${trainerPokemon.id}.png` : null

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Card outer border - like a Pokemon card */}
      <div className="rounded-lg border-2 border-poke-yellow/30 bg-poke-card p-4 sm:p-6 shadow-lg shadow-black/30">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            {spriteUrl ? (
              <img
                src={spriteUrl}
                alt={trainerPokemon.name}
                className={`w-12 h-12 ${isEvolving ? 'evolution-glow' : ''}`}
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : (
              <span className="text-2xl" role="img" aria-label="Pokeball">&#x26AA;</span>
            )}
            <div>
              <h1 className="font-pixel text-poke-yellow text-sm sm:text-base leading-relaxed m-0">
                TRAINER OLLIE
              </h1>
              {trainerPokemon && (
                <span className="font-pixel text-[8px] text-gray-400 leading-relaxed">
                  {trainerPokemon.name}
                </span>
              )}
            </div>
          </div>
          <div className="font-pixel text-white text-xs sm:text-sm">
            LVL {level}
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-3">
          <XPBar current={xpInLevel} max={xpToNextLevel} />
        </div>

        {/* Stats row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
          <span className="text-gray-300">
            {xpInLevel} / {xpToNextLevel} XP
            <span className="text-gray-500 ml-2">({totalXP} total)</span>
          </span>
          {streak > 0 && (
            <span className="font-pixel text-poke-yellow text-[10px] sm:text-xs">
              STREAK: {streak} {streak === 1 ? 'DAY' : 'DAYS'}
            </span>
          )}
        </div>

        {/* Battle cry */}
        <p className="mt-3 text-center text-gray-400 italic text-sm">
          {battleCry}
        </p>
      </div>
    </div>
  )
}
