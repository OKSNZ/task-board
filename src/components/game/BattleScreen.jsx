import { useState } from 'react'

const SPRITE_URL = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id || 132}.png`

export default function BattleScreen({ project, onClose, onCompleteTask }) {
  const [lastXP, setLastXP] = useState(null)

  const handleComplete = (taskId) => {
    onCompleteTask(project.id, taskId)
    setLastXP(taskId)
    setTimeout(() => setLastXP(null), 1000)
  }

  const done = project.tasks.filter(t => t.completed).length
  const total = project.tasks.length
  const allDone = done === total

  return (
    <div className="fixed inset-0 bg-poke-dark z-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={SPRITE_URL(project.pokemonId)}
            alt={project.title}
            style={{ imageRendering: 'pixelated' }}
            className="w-16 h-16"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <div>
            <h2 className="font-pixel text-poke-yellow text-sm">{project.title}</h2>
            <p className="font-pixel text-gray-400 text-[10px]">{done}/{total} DEFEATED</p>
          </div>
        </div>
        <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-poke-red transition-all duration-500"
            style={{ width: total > 0 ? `${((total - done) / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Battle prompt */}
      <div className="w-full max-w-lg bg-poke-card border border-poke-yellow/30 rounded-lg p-4 mb-4">
        <p className="font-pixel text-white text-[10px] mb-3">
          {allDone ? 'ALL TASKS DEFEATED! QUEST COMPLETE!' : 'What will TRAINER OLLIE do?'}
        </p>

        {/* Task list as moves */}
        <div className="flex flex-col gap-2">
          {project.tasks.map(task => (
            <div key={task.id} className="relative">
              <button
                onClick={() => !task.completed && handleComplete(task.id)}
                disabled={task.completed}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded border text-left
                  transition-all duration-200
                  ${task.completed
                    ? 'border-green-500/30 bg-green-500/10 text-green-400 cursor-not-allowed'
                    : 'border-poke-yellow/30 bg-poke-dark hover:bg-poke-yellow/10 text-white cursor-pointer'
                  }
                `}
              >
                <span className="text-sm flex items-center gap-2">
                  {task.completed ? '✓' : '⚔'} {task.text}
                </span>
                {!task.completed && (
                  <span className="font-pixel text-poke-yellow text-[8px]">+25XP</span>
                )}
              </button>
              {lastXP === task.id && (
                <span className="xp-flash absolute right-2 top-0 font-pixel text-poke-yellow text-xs">
                  +25 XP!
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <button
        onClick={onClose}
        className="font-pixel text-gray-400 text-[10px] border border-gray-600 px-4 py-2 rounded hover:border-gray-400 cursor-pointer"
      >
        {allDone ? '▶ RETURN TO VILLAGE' : 'B  RETREAT'}
      </button>

      {/* Victory overlay */}
      {allDone && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="font-pixel text-poke-yellow text-xl text-center battle-victory">
            QUEST COMPLETE!
          </div>
        </div>
      )}
    </div>
  )
}
