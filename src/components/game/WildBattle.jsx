import { useState, useEffect } from 'react'

export const GEN1_NAMES = [
  'BULBASAUR','IVYSAUR','VENUSAUR','CHARMANDER','CHARMELEON','CHARIZARD',
  'SQUIRTLE','WARTORTLE','BLASTOISE','CATERPIE','METAPOD','BUTTERFREE',
  'WEEDLE','KAKUNA','BEEDRILL','PIDGEY','PIDGEOTTO','PIDGEOT',
  'RATTATA','RATICATE','SPEAROW','FEAROW','EKANS','ARBOK',
  'PIKACHU','RAICHU','SANDSHREW','SANDSLASH','NIDORAN','NIDORINA',
  'NIDOQUEEN','NIDORAN','NIDORINO','NIDOKING','CLEFAIRY','CLEFABLE',
  'VULPIX','NINETALES','JIGGLYPUFF','WIGGLYTUFF','ZUBAT','GOLBAT',
  'ODDISH','GLOOM','VILEPLUME','PARAS','PARASECT','VENONAT',
  'VENOMOTH','DIGLETT','DUGTRIO','MEOWTH','PERSIAN','PSYDUCK',
  'GOLDUCK','MANKEY','PRIMEAPE','GROWLITHE','ARCANINE','POLIWAG',
  'POLIWHIRL','POLIWRATH','ABRA','KADABRA','ALAKAZAM','MACHOP',
  'MACHOKE','MACHAMP','BELLSPROUT','WEEPINBELL','VICTREEBEL','TENTACOOL',
  'TENTACRUEL','GEODUDE','GRAVELER','GOLEM','PONYTA','RAPIDASH',
  'SLOWPOKE','SLOWBRO','MAGNEMITE','MAGNETON','FARFETCHD','DODUO',
  'DODRIO','SEEL','DEWGONG','GRIMER','MUK','SHELLDER',
  'CLOYSTER','GASTLY','HAUNTER','GENGAR','ONIX','DROWZEE',
  'HYPNO','KRABBY','KINGLER','VOLTORB','ELECTRODE','EXEGGCUTE',
  'EXEGGUTOR','CUBONE','MAROWAK','HITMONLEE','HITMONCHAN','LICKITUNG',
  'KOFFING','WEEZING','RHYHORN','RHYDON','CHANSEY','TANGELA',
  'KANGASKHAN','HORSEA','SEADRA','GOLDEEN','SEAKING','STARYU',
  'STARMIE','MR MIME','SCYTHER','JYNX','ELECTABUZZ','MAGMAR',
  'PINSIR','TAUROS','MAGIKARP','GYARADOS','LAPRAS','DITTO',
  'EEVEE','VAPOREON','JOLTEON','FLAREON','PORYGON','OMANYTE',
  'OMASTAR','KABUTO','KABUTOPS','AERODACTYL','SNORLAX','ARTICUNO',
  'ZAPDOS','MOLTRES','DRATINI','DRAGONAIR','DRAGONITE','MEWTWO','MEW',
]

// Snarky procrastination messages
const PROCRASTINATE_MSGS = [
  "You stared at it. It stared back. Nothing got done.",
  "A wild distraction. You let it win. Classic.",
  "You chose chaos. The task board judged you silently.",
  "Productivity: 0. Regret: pending.",
  "The DISTRACTION returns to the void. So do your ambitions.",
]

export default function WildBattle({ pokemonId, pokemonName, onFocus, onProcrastinate }) {
  const [phase, setPhase] = useState('appear') // appear | choice | result
  const [result, setResult] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setPhase('choice'), 1000)
    return () => clearTimeout(t)
  }, [])

  // Auto-dismiss after 8s if no action
  useEffect(() => {
    const t = setTimeout(() => onFocus(), 8000)
    return () => clearTimeout(t)
  }, [onFocus])

  const handleFocus = () => {
    setResult('focus')
    setPhase('result')
    setTimeout(onFocus, 1200)
  }

  const handleProcrastinate = () => {
    setResult('procrastinate')
    setPhase('result')
    setTimeout(onProcrastinate, 1800)
  }

  const shameMsg = PROCRASTINATE_MSGS[Math.floor(Math.random() * PROCRASTINATE_MSGS.length)]

  return (
    <div className="absolute inset-0 bg-poke-dark z-30 flex flex-col items-center justify-center p-6">
      {/* Pokemon sprite */}
      <div className="mb-4 relative">
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
          alt={pokemonName}
          style={{ imageRendering: 'pixelated', width: 96, height: 96 }}
          className={phase === 'appear' ? 'wild-appear' : ''}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </div>

      {/* Dialogue box */}
      <div className="w-full max-w-sm bg-poke-card border-2 border-poke-yellow/40 rounded-lg p-4">
        {phase === 'appear' && (
          <p className="font-pixel text-white text-[10px] leading-relaxed">
            A wild {pokemonName} appeared!
          </p>
        )}

        {phase === 'choice' && (
          <>
            <p className="font-pixel text-white text-[10px] mb-4 leading-relaxed">
              A wild DISTRACTION appeared!<br />What will you do?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleFocus}
                className="flex-1 font-pixel text-[9px] py-2 px-3 bg-green-600 border border-green-400 rounded text-white hover:bg-green-500 active:bg-green-700"
              >
                FOCUS<br /><span className="text-[7px] text-green-200">+10 XP</span>
              </button>
              <button
                onClick={handleProcrastinate}
                className="flex-1 font-pixel text-[9px] py-2 px-3 bg-gray-700 border border-gray-500 rounded text-gray-300 hover:bg-gray-600"
              >
                PROCRASTINATE<br /><span className="text-[7px] text-gray-400">...</span>
              </button>
            </div>
          </>
        )}

        {phase === 'result' && result === 'focus' && (
          <p className="font-pixel text-green-400 text-[10px] leading-relaxed">
            You stayed focused!<br />+10 XP gained!
          </p>
        )}

        {phase === 'result' && result === 'procrastinate' && (
          <p className="font-pixel text-gray-400 text-[10px] leading-relaxed">
            {shameMsg}
          </p>
        )}
      </div>
    </div>
  )
}
