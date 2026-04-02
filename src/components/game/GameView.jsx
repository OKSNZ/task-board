import { useState, useEffect, useCallback } from 'react'
import GameCanvas from './GameCanvas'
import DPad from './DPad'
import HUD from './HUD'
import DialogueBox from './DialogueBox'
import BattleScreen from './BattleScreen'
import { useGameEngine } from '../../hooks/useGameEngine'
import { NPC_DIALOGUES, POKEMON_CENTRE_DIALOGUE } from '../../data/npcData'

export default function GameView({
  projects, level, xpInLevel, xpToNextLevel, streak, trainerPokemon, onCompleteTask
}) {
  const { playerPos, facing, nearbyNPC, nearbyBuilding, currentDoor, movePlayer } = useGameEngine()
  const [dialogue, setDialogue] = useState(null)
  const [battle, setBattle] = useState(null)

  // Auto-enter building when player steps onto a door tile (Pokémon-style)
  useEffect(() => {
    if (!currentDoor || dialogue || battle) return
    if (currentDoor.locked) {
      setDialogue({ lines: ['This building is locked.', 'Come back when the blockers are resolved.'] })
      return
    }
    if (currentDoor.projectId === null) {
      setDialogue({ lines: POKEMON_CENTRE_DIALOGUE })
      return
    }
    const project = projects.find(p => p.id === currentDoor.projectId)
    if (project) setBattle(project)
  }, [currentDoor])

  const handleInteract = useCallback(() => {
    if (dialogue) return
    if (nearbyNPC) {
      const lines = NPC_DIALOGUES[nearbyNPC.id] || ['...']
      setDialogue({ lines })
      return
    }
    if (nearbyBuilding) {
      if (nearbyBuilding.locked) {
        setDialogue({ lines: ['This building is locked.', 'Come back when the blockers are resolved.'] })
        return
      }
      if (nearbyBuilding.projectId === null) {
        setDialogue({ lines: POKEMON_CENTRE_DIALOGUE })
        return
      }
      const project = projects.find(p => p.id === nearbyBuilding.projectId)
      if (project) setBattle(project)
    }
  }, [dialogue, nearbyNPC, nearbyBuilding, projects])

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
          <GameCanvas playerPos={playerPos} facing={facing} projects={projects} />

          {/* HUD overlay */}
          <HUD
            level={level}
            xpInLevel={xpInLevel}
            xpToNextLevel={xpToNextLevel}
            streak={streak}
            trainerPokemon={trainerPokemon}
          />

          {/* Interact hint — clickable button */}
          {(nearbyNPC || nearbyBuilding) && !dialogue && !battle && (
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
