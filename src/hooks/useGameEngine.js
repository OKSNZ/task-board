import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
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
  const stepCountRef = useRef(0)
  const [stepCount, setStepCount] = useState(0)
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
      // Increment step count on successful move
      if (next.x !== prev.x || next.y !== prev.y) {
        stepCountRef.current += 1
        setStepCount(stepCountRef.current)
      }
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

  // Exact door match — player is standing on this building's door tile
  const currentDoor = BUILDING_DOORS.find(d =>
    d.tileX === playerPos.x && d.tileY === playerPos.y
  ) ?? null

  // NPC within 1 tile (only when NOT on a door tile, so buildings take priority)
  const nearbyNPC = currentDoor ? null : NPC_SPAWNS.find(n =>
    Math.abs(n.tileX - playerPos.x) + Math.abs(n.tileY - playerPos.y) <= 1
  ) ?? null

  // Building within 1 tile (fallback for SPACE interaction when adjacent)
  const nearbyBuilding = currentDoor ?? BUILDING_DOORS.find(d =>
    Math.abs(d.tileX - playerPos.x) <= 1 && Math.abs(d.tileY - playerPos.y) <= 1
  ) ?? null

  // Camera follow: centre player in a 15×11 viewport
  const CAM_W = 15
  const CAM_H = 11
  const MAP_W = 20
  const MAP_H = 15
  const cameraOffset = useMemo(() => {
    const camX = Math.max(0, Math.min(MAP_W - CAM_W, playerPos.x - Math.floor(CAM_W / 2)))
    const camY = Math.max(0, Math.min(MAP_H - CAM_H, playerPos.y - Math.floor(CAM_H / 2)))
    return { x: camX, y: camY }
  }, [playerPos])

  return { playerPos, facing, nearbyNPC, nearbyBuilding, currentDoor, movePlayer, stepCount, cameraOffset }
}
