import { useState, useCallback, useEffect, useRef } from 'react'
import { seedProjects, seedGameState } from '../data/seedData'

const STORAGE_KEY_PROJECTS = 'taskboard-projects'
const STORAGE_KEY_GAME = 'taskboard-game'
const XP_PER_TASK = 25
const XP_PER_LEVEL = 100
const MAX_LEVEL = 100

const POKEMON_BY_ID = {
  'ppc-landing': 39,
  'gtm-n8n': 101,
  'youtube-seo': 441,
  'paddle-website': 79,
  'hs-chatbot': 137,
  'ads-dashboard': 100,
}

function loadFromStorage(key) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

function getLevel(xp) {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, MAX_LEVEL)
}

function getXPInCurrentLevel(xp) {
  return xp % XP_PER_LEVEL
}

function getBattleCry(level) {
  if (level <= 5) return 'Starting your journey...'
  if (level <= 15) return 'Gaining experience!'
  if (level <= 30) return 'Getting stronger!'
  if (level <= 50) return 'A seasoned trainer!'
  return 'Elite trainer status!'
}

function deriveProjectStatus(project) {
  if (project.status === 'parked') return 'parked'
  if (project.tasks.length > 0 && project.tasks.every((t) => t.completed)) return 'done'
  return 'active'
}

export function getTrainerPokemon(level) {
  if (level >= 10) return { id: 6, name: 'CHARIZARD' }
  if (level >= 6) return { id: 5, name: 'CHARMELEON' }
  if (level >= 3) return { id: 4, name: 'CHARMANDER' }
  if (level >= 2) return { id: 2, name: 'IVYSAUR' }
  return { id: 1, name: 'BULBASAUR' }
}

function migrateProjects(projects) {
  return projects.map((p) => ({
    ...p,
    pokemonId: p.pokemonId ?? (POKEMON_BY_ID[p.id] ?? 132),
  }))
}

export function useGameState() {
  const [projects, setProjects] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEY_PROJECTS)
    if (stored) return migrateProjects(stored)
    return seedProjects
  })

  const [game, setGame] = useState(() => {
    return loadFromStorage(STORAGE_KEY_GAME) || seedGameState
  })

  const completedRef = useRef(new Set())
  const [prevLevel, setPrevLevel] = useState(null)
  const [isEvolving, setIsEvolving] = useState(false)

  // Persist to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEY_PROJECTS, projects)
  }, [projects])

  useEffect(() => {
    saveToStorage(STORAGE_KEY_GAME, game)
  }, [game])

  // Build the set of already-completed task IDs on mount
  useEffect(() => {
    const ids = new Set()
    projects.forEach((p) => p.tasks.forEach((t) => { if (t.completed) ids.add(t.id) }))
    completedRef.current = ids
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const level = getLevel(game.xp)
  const trainerPokemon = getTrainerPokemon(level)

  // Detect evolution
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (prevLevel === null) {
      setPrevLevel(level)
      return
    }
    if (level !== prevLevel) {
      const prevPoke = getTrainerPokemon(prevLevel)
      const newPoke = getTrainerPokemon(level)
      setPrevLevel(level)
      if (prevPoke.id !== newPoke.id) {
        setIsEvolving(true)
        const timer = setTimeout(() => setIsEvolving(false), 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [level, prevLevel])
  /* eslint-enable react-hooks/set-state-in-effect */

  const completeTask = useCallback((projectId, taskId) => {
    // Guard: if this task was already completed, do nothing
    if (completedRef.current.has(taskId)) return
    completedRef.current.add(taskId)

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project
        return {
          ...project,
          tasks: project.tasks.map((task) => {
            if (task.id !== taskId) return task
            if (task.completed) return task
            return { ...task, completed: true }
          }),
        }
      })
    )

    const MAX_XP = (MAX_LEVEL - 1) * XP_PER_LEVEL

    // Award XP and update streak
    setGame((prev) => {
      if (prev.xp >= MAX_XP) return prev

      const today = getTodayString()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      let newStreak = prev.streak
      if (prev.lastCompletionDate === today) {
        // Already completed something today, streak stays
      } else if (prev.lastCompletionDate === yesterdayStr) {
        newStreak = prev.streak + 1
      } else {
        newStreak = 1
      }

      return {
        xp: Math.min(prev.xp + XP_PER_TASK, MAX_XP),
        lastCompletionDate: today,
        streak: newStreak,
      }
    })
  }, [])

  const reorderTask = useCallback((projectId, oldIndex, newIndex) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const tasks = [...p.tasks]
        const [moved] = tasks.splice(oldIndex, 1)
        tasks.splice(newIndex, 0, moved)
        return { ...p, tasks }
      })
    )
  }, [])

  const breakdownTask = useCallback((projectId, taskId, microTaskTexts) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const idx = p.tasks.findIndex((t) => t.id === taskId)
        if (idx === -1) return p
        const newTasks = microTaskTexts.map((text, i) => ({
          id: `${taskId}-micro-${i}-${Date.now()}`,
          text,
          completed: false,
        }))
        const tasks = [...p.tasks]
        tasks.splice(idx, 1, ...newTasks)
        return { ...p, tasks }
      })
    )
  }, [])

  const MAX_XP = (MAX_LEVEL - 1) * XP_PER_LEVEL
  const atMaxLevel = game.xp >= MAX_XP
  const xpInLevel = atMaxLevel ? XP_PER_LEVEL : getXPInCurrentLevel(game.xp)
  const battleCry = getBattleCry(level)

  const activeProjects = projects.filter((p) => deriveProjectStatus(p) === 'active')
  const parkedProjects = projects.filter((p) => deriveProjectStatus(p) === 'parked')
  const doneProjects = projects.filter((p) => deriveProjectStatus(p) === 'done')

  return {
    projects,
    activeProjects,
    parkedProjects,
    doneProjects,
    game,
    level,
    xpInLevel,
    xpToNextLevel: XP_PER_LEVEL,
    totalXP: game.xp,
    streak: game.streak,
    battleCry,
    completeTask,
    reorderTask,
    breakdownTask,
    trainerPokemon,
    isEvolving,
  }
}
