import { useState, useEffect, useCallback, useRef } from 'react'
import GameCanvas from './GameCanvas'
import DPad from './DPad'
import HUD from './HUD'
import DialogueBox from './DialogueBox'
import BattleScreen from './BattleScreen'
import WildBattle, { GEN1_NAMES } from './WildBattle'
import BattleTransition from './BattleTransition'
import { useGameEngine } from '../../hooks/useGameEngine'
import { NPC_DIALOGUES, POKEMON_CENTRE_DIALOGUE } from '../../data/npcData'
import { MAP_TILES } from '../../data/mapData'

export default function GameView({
  projects, level, xpInLevel, xpToNextLevel, streak, trainerPokemon, onCompleteTask
}) {
  const { playerPos, facing, nearbyNPC, nearbyBuilding, currentDoor, movePlayer, stepCount, cameraOffset } = useGameEngine()
  const [dialogue, setDialogue] = useState(null)
  const [battle, setBattle] = useState(null)
  const [wildEncounter, setWildEncounter] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [pendingBattle, setPendingBattle] = useState(null)
  const prevPosRef = useRef(null)

  // Wild encounter trigger on grass tiles
  useEffect(() => {
    const prev = prevPosRef.current
    prevPosRef.current = playerPos

    if (!prev) return
    if (prev.x === playerPos.x && prev.y === playerPos.y) return
    if (wildEncounter || battle || dialogue || transitioning) return

    // Check if on grass tile
    const tile = MAP_TILES[playerPos.y]?.[playerPos.x]
    if (tile !== 'G') return

    // 15% encounter rate
    if (Math.random() > 0.15) return

    const id = Math.floor(Math.random() * 151) + 1
    const name = GEN1_NAMES[id - 1] || 'POKEMON'

    setTransitioning(true)
    setPendingBattle({ type: 'wild', pokemonId: id, pokemonName: name })
  }, [playerPos, wildEncounter, battle, dialogue, transitioning])

  const handleTransitionComplete = useCallback(() => {
    setTransitioning(false)
    if (!pendingBattle) return
    if (pendingBattle.type === 'wild') {
      setWildEncounter({ pokemonId: pendingBattle.pokemonId, pokemonName: pendingBattle.pokemonName })
    } else if (pendingBattle.type === 'project') {
      setBattle(pendingBattle.project)
    } else if (pendingBattle.type === 'locked') {
      setDialogue({ lines: ['This building is locked.', 'Come back when the blockers are resolved.'] })
    } else if (pendingBattle.type === 'centre') {
      setDialogue({ lines: POKEMON_CENTRE_DIALOGUE })
    }
    setPendingBattle(null)
  }, [pendingBattle])

  // Auto-enter building when player steps onto a door tile
  useEffect(() => {
    if (!currentDoor || dialogue || battle || wildEncounter || transitioning) return
    setTransitioning(true)
    if (currentDoor.locked) {
      setPendingBattle({ type: 'locked' })
    } else if (currentDoor.projectId === null) {
      setPendingBattle({ type: 'centre' })
    } else {
      const project = projects.find(p => p.id === currentDoor.projectId)
      if (project) setPendingBattle({ type: 'project', project })
    }
  }, [currentDoor, dialogue, battle, wildEncounter, transitioning, projects])

  const handleInteract = useCallback(() => {
    if (dialogue || transitioning || wildEncounter) return
    if (nearbyNPC) {
      const lines = NPC_DIALOGUES[nearbyNPC.id] || ['...']
      setDialogue({ lines })
      return
    }
    if (nearbyBuilding) {
      setTransitioning(true)
      if (nearbyBuilding.locked) {
        setPendingBattle({ type: 'locked' })
      } else if (nearbyBuilding.projectId === null) {
        setPendingBattle({ type: 'centre' })
      } else {
        const project = projects.find(p => p.id === nearbyBuilding.projectId)
        if (project) setPendingBattle({ type: 'project', project })
      }
    }
  }, [dialogue, transitioning, wildEncounter, nearbyNPC, nearbyBuilding, projects])

  // SPACE/E to interact
  useEffect(() => {
    const handler = (e) => {
      if (['Space', 'KeyE'].includes(e.code) && !battle) {
        e.preventDefault()
        handleInteract()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleInteract, battle])

  return (
    <div className="relative w-full">
      {/* GameBoy frame */}
      <div className="gameboy-frame">
        <div className="gameboy-screen">
          <GameCanvas playerPos={playerPos} facing={facing} projects={projects} stepCount={stepCount} cameraOffset={cameraOffset} />

          {/* HUD overlay */}
          <HUD
            level={level}
            xpInLevel={xpInLevel}
            xpToNextLevel={xpToNextLevel}
            streak={streak}
            trainerPokemon={trainerPokemon}
          />

          {/* Interact hint — clickable button */}
          {(nearbyNPC || nearbyBuilding) && !dialogue && !battle && !wildEncounter && !transitioning && (
            <button
              onClick={handleInteract}
              className="absolute top-2 left-2 bg-black/80 border border-poke-yellow/40 rounded px-2 py-1 cursor-pointer hover:bg-poke-yellow/10"
            >
              <span className="font-pixel text-poke-yellow text-[8px]">
                {nearbyBuilding?.locked ? '🔒 LOCKED' : '▶ ENTER / TALK'}
              </span>
            </button>
          )}

          {/* Dialogue overlay */}
          {dialogue && (
            <DialogueBox lines={dialogue.lines} onClose={() => setDialogue(null)} />
          )}

          {/* Battle transition flash */}
          {transitioning && (
            <BattleTransition onComplete={handleTransitionComplete} />
          )}

          {/* Wild encounter */}
          {wildEncounter && (
            <WildBattle
              pokemonId={wildEncounter.pokemonId}
              pokemonName={wildEncounter.pokemonName}
              onFocus={() => setWildEncounter(null)}
              onProcrastinate={() => setWildEncounter(null)}
            />
          )}
        </div>
      </div>

      {/* Mobile controls */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <DPad onMove={movePlayer} />
        <button
          onClick={handleInteract}
          className="w-14 h-14 rounded-full bg-poke-red border-2 border-red-800 font-pixel text-white text-xs flex items-center justify-center active:bg-red-800 cursor-pointer"
          aria-label="Interact"
        >
          A
        </button>
      </div>

      {/* Desktop controls hint */}
      <div className="hidden lg:block text-center mt-2">
        <span className="font-pixel text-gray-500 text-[8px]">
          ARROW KEYS to move  |  SPACE / E to interact
        </span>
      </div>

      {/* Battle screen */}
      {battle && (
        <BattleScreen
          project={battle}
          onClose={() => setBattle(null)}
          onCompleteTask={onCompleteTask}
        />
      )}
    </div>
  )
}
