import { useState, useCallback } from 'react'
import TrainerCard from './components/TrainerCard'
import ProjectBoard from './components/ProjectBoard'
import VillageView from './components/VillageView'
import GameView from './components/game/GameView'
import BattleAnimation from './components/BattleAnimation'
import { useGameState } from './hooks/useGameState'

const VIEW_STORAGE_KEY = 'taskboard-view'

function loadView() {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) || 'board'
  } catch {
    return 'board'
  }
}

export default function App() {
  const {
    projects,
    activeProjects,
    parkedProjects,
    doneProjects,
    level,
    xpInLevel,
    xpToNextLevel,
    totalXP,
    streak,
    battleCry,
    completeTask,
    reorderTask,
    breakdownTask,
    trainerPokemon,
    isEvolving,
  } = useGameState()

  const [view, setView] = useState(loadView)
  const [activeBattle, setActiveBattle] = useState(null)

  const handleViewChange = useCallback((newView) => {
    setView(newView)
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, newView)
    } catch {
      // ignore
    }
  }, [])

  const handleCompleteTask = useCallback((projectId, taskId) => {
    const allProjects = [...activeProjects, ...parkedProjects, ...doneProjects]
    const project = allProjects.find((p) => p.id === projectId)
    const task = project?.tasks.find((t) => t.id === taskId)
    completeTask(projectId, taskId)
    if (task && project && !task.completed) {
      setActiveBattle({
        taskText: task.text,
        pokemonId: project.pokemonId || 132,
        xpGained: 25,
      })
    }
  }, [activeProjects, parkedProjects, doneProjects, completeTask])

  const dismissBattle = useCallback(() => setActiveBattle(null), [])

  return (
    <div className="min-h-screen bg-poke-dark px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Trainer card */}
        <div className="mb-6">
          <TrainerCard
            level={level}
            xpInLevel={xpInLevel}
            xpToNextLevel={xpToNextLevel}
            totalXP={totalXP}
            streak={streak}
            battleCry={battleCry}
            trainerPokemon={trainerPokemon}
            isEvolving={isEvolving}
          />
        </div>

        {/* View toggle */}
        <div className="flex justify-center gap-2 mb-6">
          {['game', 'board', 'village'].map(v => (
            <button
              key={v}
              onClick={() => handleViewChange(v)}
              className={`font-pixel text-[10px] px-4 py-2 rounded border cursor-pointer transition-colors ${
                view === v
                  ? 'bg-poke-yellow/20 text-poke-yellow border-poke-yellow/50'
                  : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
              }`}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Game, Board, or Village view */}
        {view === 'game' ? (
          <GameView
            projects={[...activeProjects, ...parkedProjects, ...doneProjects]}
            level={level}
            xpInLevel={xpInLevel}
            xpToNextLevel={xpToNextLevel}
            streak={streak}
            trainerPokemon={trainerPokemon}
            onCompleteTask={handleCompleteTask}
          />
        ) : view === 'board' ? (
          <ProjectBoard
            activeProjects={activeProjects}
            parkedProjects={parkedProjects}
            doneProjects={doneProjects}
            onComplete={handleCompleteTask}
            onReorder={reorderTask}
            onBreakdown={breakdownTask}
          />
        ) : (
          <VillageView
            projects={projects}
            onComplete={handleCompleteTask}
          />
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-xs">
          <span className="font-pixel text-[8px]">GOTTA SHIP EM ALL</span>
        </div>
      </div>

      {/* Battle animation overlay */}
      <BattleAnimation battle={activeBattle} onDismiss={dismissBattle} />
    </div>
  )
}
