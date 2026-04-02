import { useState, useEffect, useCallback, useRef } from 'react'
import { MAP_TILES, TILE_SIZE, NPC_SPAWNS, BUILDING_DOORS, PLAYER_SPAWN } from '../data/mapData'

const STORAGE_KEY_PLAYER = 'taskboard-player'

// Returns the tile type at (x, y)
function getTile(x, y) {
  if (y < 0 || y >= MAP_TILES.length) return 'T'
  if (x < 0 || x >= MAP_TILES[0].length) return 'T'
  return MAP_TILES[y][x]
}

// Returns true if tile is walkable
function isWalkable(tile) {
  return ['G', 'P', 'D', 'N', 'S'].includes(tile)
}

export { TILE_SIZE, NPC_SPAWNS, BUILDING_DOORS, PLAYER_SPAWN }

export function useGameEngine() {
  const [playerPos, setPlayerPos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAYER)
      return saved ? JSON.parse(saved) : { x: PLAYER_SPAWN.tileX, y: PLAYER_SPAWN.tileY }
    } catch {
      return { x: PLAYER_SPAWN.tileX, y: PLAYER_SPAWN.tileY }
    }
  })
  const [facing, setFacing] = useState('down')
  const moveCooldown = useRef(false)

  // Persist player position
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLAYER, JSON.stringify(playerPos))
  }, [playerPos])

  const movePlayer = useCallback((dir) => {
    if (moveCooldown.current) return
    moveCooldown.current = true
    setTimeout(() => { moveCooldown.current = false }, 150)

    setFacing(dir)
    setPlayerPos(prev => {
      const next = { ...prev }
      if (dir === 'up') next.y -= 1
      if (dir === 'down') next.y += 1
      if (dir === 'left') next.x -= 1
      if (dir === 'right') next.x += 1
      // Clamp to map bounds
      next.x = Math.max(0, Math.min(19, next.x))
      next.y = Math.max(0, Math.min(14, next.y))
      // Check collision
      if (!isWalkable(getTile(next.x, next.y))) return prev
      return next
    })
  }, [])

  // Arrow key + WASD listener
  useEffect(() => {
    const handler = (e) => {
      const map = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      }
      if (map[e.key]) {
        e.preventDefault()
        movePlayer(map[e.key])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [movePlayer])

  // Derived: what is nearby (within 1 tile Manhattan distance)
  const nearbyNPC = NPC_SPAWNS.find(n =>
    Math.abs(n.tileX - playerPos.x) + Math.abs(n.tileY - playerPos.y) <= 1
  ) ?? null

  const nearbyBuilding = BUILDING_DOORS.find(d =>
    Math.abs(d.tileX - playerPos.x) <= 1 && Math.abs(d.tileY - playerPos.y) <= 1
  ) ?? null

  return { playerPos, facing, nearbyNPC, nearbyBuilding, movePlayer }
}
