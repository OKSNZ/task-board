export default function HUD({ level, xpInLevel, xpToNextLevel, streak, trainerPokemon }) {
  return (
    <div className="absolute top-2 right-2 bg-black/80 border border-poke-yellow/40 rounded p-2 text-right pointer-events-none">
      <div className="flex items-center gap-2 justify-end mb-1">
        {trainerPokemon && (
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${trainerPokemon.id}.png`}
            alt={trainerPokemon.name}
            style={{ imageRendering: 'pixelated' }}
            className="w-8 h-8"
          />
        )}
        <span className="font-pixel text-poke-yellow text-[10px]">LVL {level}</span>
      </div>
      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
        <div
          className="h-full bg-poke-red xp-bar-fill"
          style={{ width: `${(xpInLevel / xpToNextLevel) * 100}%` }}
        />
      </div>
      {streak > 0 && (
        <span className="font-pixel text-[8px] text-orange-400">{streak} streak</span>
      )}
    </div>
  )
}
