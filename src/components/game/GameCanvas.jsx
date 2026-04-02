import { useEffect, useRef, useState } from 'react'
import { MAP_TILES, TILE_SIZE, NPC_SPAWNS, BUILDING_DOORS } from '../../data/mapData'

// Assign a Pokemon sprite to each NPC role
const NPC_POKEMON = {
  professor: 65,   // Alakazam - wise professor
  sage:      35,   // Clefairy - creative/content
  admaster:  125,  // Electabuzz - energetic
  chief:     68,   // Machamp - strength/training
  analyst:   137,  // Porygon - data/digital
}

// Pre-load a sprite image, returns a promise, caches results
const imageCache = new Map()
function loadSprite(url) {
  if (imageCache.has(url)) return imageCache.get(url)
  const p = new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
  imageCache.set(url, p)
  return p
}

// -- Tile drawing functions --

function drawGrass(ctx, x, y) {
  const s = TILE_SIZE
  // Base green
  ctx.fillStyle = '#78c050'
  ctx.fillRect(x, y, s, s)
  // Darker checkerboard cells (8x8)
  ctx.fillStyle = '#68a840'
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if ((r + c) % 2 === 1) ctx.fillRect(x + c * 8, y + r * 8, 8, 8)
    }
  }
  // Top-left highlight edge
  ctx.fillStyle = '#90d860'
  ctx.fillRect(x, y, 1, s)
  ctx.fillRect(x, y, s, 1)
}

function drawPath(ctx, x, y) {
  const s = TILE_SIZE
  ctx.fillStyle = '#e8d090'
  ctx.fillRect(x, y, s, s)
  // Subtle texture dots
  ctx.fillStyle = '#d8c080'
  ctx.fillRect(x + 4, y + 4, 3, 2)
  ctx.fillRect(x + 18, y + 12, 3, 2)
  ctx.fillRect(x + 10, y + 22, 3, 2)
  ctx.fillRect(x + 24, y + 6, 3, 2)
  // Border shadows
  ctx.fillStyle = '#c8b070'
  ctx.fillRect(x + s - 1, y, 1, s)
  ctx.fillRect(x, y + s - 1, s, 1)
}

function drawTree(ctx, x, y) {
  const s = TILE_SIZE
  // Dark background
  ctx.fillStyle = '#185820'
  ctx.fillRect(x, y, s, s)
  // Main bush body
  ctx.fillStyle = '#30a030'
  ctx.fillRect(x + 3, y + 6, s - 6, s - 8)
  // Three bump top
  ctx.fillStyle = '#48c040'
  ctx.fillRect(x + 4, y + 2, 7, 9)   // left bump
  ctx.fillRect(x + s/2 - 4, y, 8, 10) // centre bump
  ctx.fillRect(x + s - 11, y + 2, 7, 9) // right bump
  // Highlight on each bump
  ctx.fillStyle = '#68e058'
  ctx.fillRect(x + 5, y + 3, 3, 3)
  ctx.fillRect(x + s/2 - 3, y + 1, 3, 3)
  ctx.fillRect(x + s - 10, y + 3, 3, 3)
  // Dark shadow bottom
  ctx.fillStyle = '#0e3a10'
  ctx.fillRect(x + 3, y + s - 5, s - 6, 3)
  // Outline
  ctx.strokeStyle = '#0a2a0a'
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1)
}

function drawBuilding(ctx, door) {
  const s = TILE_SIZE
  const bx = (door.tileX - 1) * s
  const by = (door.tileY - 2) * s
  const w = s * 3
  const h = s * 2
  const locked = door.locked

  // Wall
  ctx.fillStyle = locked ? '#909090' : '#f8f0d8'
  ctx.fillRect(bx, by, w, h)

  // Brick rows (subtle)
  if (!locked) {
    ctx.fillStyle = '#e8e0c8'
    for (let row = 0; row < 3; row++) {
      const offset = row % 2 === 0 ? 0 : s / 2
      for (let col = 0; col < 4; col++) {
        ctx.fillRect(bx + col * (s * 3 / 4) + offset, by + row * 10 + h / 2, s * 3 / 4 - 1, 9)
      }
    }
  }

  // Roof body
  ctx.fillStyle = locked ? '#606878' : '#d83020'
  ctx.fillRect(bx - 3, by, w + 6, s / 2)

  // Roof overhang shadow
  ctx.fillStyle = locked ? '#404850' : '#a01808'
  ctx.fillRect(bx - 3, by + s / 2 - 3, w + 6, 4)

  // Chimney
  if (!locked) {
    ctx.fillStyle = '#b02818'
    ctx.fillRect(bx + w - 14, by - 8, 8, 12)
    ctx.fillStyle = '#802010'
    ctx.fillRect(bx + w - 16, by - 9, 12, 4)
  }

  // Windows
  if (!locked) {
    const drawWindow = (wx, wy) => {
      ctx.fillStyle = '#8090c8'
      ctx.fillRect(wx, wy, 14, 12)
      ctx.fillStyle = '#a0b0e8'
      ctx.fillRect(wx + 1, wy + 1, 6, 5)   // top-left pane
      ctx.fillRect(wx + 8, wy + 1, 5, 5)   // top-right pane
      ctx.fillStyle = '#c0d0ff'
      ctx.fillRect(wx + 2, wy + 2, 2, 2)   // shine
      ctx.strokeStyle = '#404060'
      ctx.lineWidth = 1
      ctx.strokeRect(wx + 0.5, wy + 0.5, 13, 11)
    }
    drawWindow(bx + 6, by + s / 2 + 6)
    drawWindow(bx + w - 20, by + s / 2 + 6)
  }

  // Door
  ctx.fillStyle = locked ? '#505060' : '#8b5020'
  ctx.fillRect(bx + w / 2 - 9, by + h - s / 2, 18, s / 2)
  if (!locked) {
    ctx.fillStyle = '#6b3810'
    ctx.fillRect(bx + w / 2 - 8, by + h - s / 2 + 1, 7, s / 2 - 2)
    ctx.fillRect(bx + w / 2 + 2, by + h - s / 2 + 1, 7, s / 2 - 2)
    // Door handle
    ctx.fillStyle = '#ffcb05'
    ctx.fillRect(bx + w / 2 - 2, by + h - s / 4, 4, 3)
  }

  // Lock icon for locked buildings
  if (locked) {
    ctx.fillStyle = '#888'
    ctx.fillRect(bx + w / 2 - 5, by + h / 2, 10, 8)
    ctx.strokeStyle = '#888'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(bx + w / 2, by + h / 2, 5, Math.PI, 0)
    ctx.stroke()
  }

  // Name label on sign above door
  const signY = by + h - s / 2 - 10
  ctx.fillStyle = locked ? '#666' : '#cc2000'
  ctx.font = 'bold 6px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(door.label, bx + w / 2, signY)
}

function drawNPC(ctx, npc, sprite) {
  const s = TILE_SIZE
  const cx = npc.tileX * s
  const cy = npc.tileY * s

  if (sprite) {
    // Draw at 2× tile size, centred on the NPC tile
    const size = s * 2
    const ox = cx + s / 2 - size / 2
    const oy = cy + s / 2 - size / 2
    // Draw shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.beginPath()
    ctx.ellipse(cx + s / 2, cy + s - 2, 16, 5, 0, 0, Math.PI * 2)
    ctx.fill()
    // Draw Pokémon sprite at 2× size
    ctx.drawImage(sprite, ox, oy, size, size)
  } else {
    // Fallback: coloured circle with initial
    ctx.fillStyle = '#e07b39'
    ctx.beginPath()
    ctx.arc(cx + s / 2, cy + s / 2 - 4, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'white'
    ctx.font = 'bold 9px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(npc.role[0], cx + s / 2, cy + s / 2)
  }
}

function drawPlayer(ctx, px, py, facing, stepCount = 0) {
  const s = TILE_SIZE
  const frame = stepCount % 2
  const headBob = frame === 0 ? 0 : -1

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(px + s / 2, py + s - 2, 9, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Shoes
  ctx.fillStyle = '#202020'
  ctx.fillRect(px + 9, py + s - 5, 5, 4)
  ctx.fillRect(px + s - 14, py + s - 5, 5, 4)

  // Legs / trousers - walk cycle
  const legOffset = frame === 0 ? 3 : -3
  ctx.fillStyle = '#3848a8'
  ctx.fillRect(px + 9, py + 20, 5, 8 + (frame === 0 ? 0 : legOffset))
  ctx.fillRect(px + s - 14, py + 20, 5, 8 + (frame === 0 ? legOffset : 0))

  // Body (jacket)
  ctx.fillStyle = '#2860c8'
  ctx.fillRect(px + 7, py + 13, s - 14, 10)

  // Collar
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(px + s / 2 - 3, py + 13, 6, 3)

  // Arms
  ctx.fillStyle = '#2860c8'
  const armY = py + 14
  ctx.fillRect(px + 3, armY, 5, 8)
  ctx.fillRect(px + s - 8, armY, 5, 8)

  // Hands
  ctx.fillStyle = '#f8c898'
  ctx.fillRect(px + 3, armY + 7, 5, 4)
  ctx.fillRect(px + s - 8, armY + 7, 5, 4)

  // Neck + face (with head bob)
  ctx.fillStyle = '#f8c898'
  ctx.fillRect(px + s / 2 - 4, py + 10 + headBob, 8, 6)  // neck
  ctx.fillRect(px + s / 2 - 5, py + 5 + headBob, 10, 10) // face

  // Hair under cap (visible from sides)
  ctx.fillStyle = '#301808'
  ctx.fillRect(px + s / 2 - 5, py + 9 + headBob, 3, 4)  // left sideburn
  ctx.fillRect(px + s / 2 + 2, py + 9 + headBob, 3, 4)  // right sideburn

  // Cap
  ctx.fillStyle = '#d82818'
  ctx.fillRect(px + s / 2 - 7, py + 1 + headBob, 14, 8)  // cap body
  // Cap brim (front only, not for 'up' facing)
  if (facing !== 'up') {
    ctx.fillStyle = '#b01808'
    ctx.fillRect(px + s / 2 - 9, py + 7 + headBob, 18, 3)
  }
  // Cap button
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(px + s / 2 - 1, py + 1 + headBob, 2, 2)

  // Eyes (only visible facing down/left/right)
  if (facing !== 'up') {
    ctx.fillStyle = '#101010'
    const eyeY = py + 10 + headBob
    if (facing === 'down') {
      ctx.fillRect(px + s / 2 - 4, eyeY, 3, 2)
      ctx.fillRect(px + s / 2 + 1, eyeY, 3, 2)
    } else if (facing === 'left') {
      ctx.fillRect(px + s / 2 - 4, eyeY, 3, 2)
    } else {
      ctx.fillRect(px + s / 2 + 1, eyeY, 3, 2)
    }
  }

  // Backpack
  ctx.fillStyle = '#a83018'
  if (facing === 'left' || facing === 'up') {
    ctx.fillRect(px + s - 8, py + 13, 6, 9)
  } else if (facing === 'right') {
    ctx.fillRect(px + 2, py + 13, 6, 9)
  }
}

// -- Main component --

export default function GameCanvas({ playerPos, facing, projects, stepCount = 0, cameraOffset = { x: 0, y: 0 } }) {
  const canvasRef = useRef(null)
  const spritesRef = useRef({})   // id -> HTMLImageElement
  const [spritesLoaded, setSpritesLoaded] = useState(0)

  // Pre-load all NPC sprites once
  useEffect(() => {
    const entries = Object.entries(NPC_POKEMON)
    Promise.all(
      entries.map(async ([id, pokemonId]) => {
        const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
        const img = await loadSprite(url)
        if (img) spritesRef.current[id] = img
      })
    ).then(() => setSpritesLoaded(n => n + 1))
  }, [])

  // Redraw canvas whenever state changes
  const VIEWPORT_W = 15
  const VIEWPORT_H = 11

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false  // keep pixel art crisp

    const W = VIEWPORT_W * TILE_SIZE
    const H = VIEWPORT_H * TILE_SIZE
    ctx.clearRect(0, 0, W, H)

    // Draw base tiles (only visible viewport)
    MAP_TILES.forEach((row, y) => {
      if (y < cameraOffset.y || y >= cameraOffset.y + VIEWPORT_H) return
      row.forEach((tile, x) => {
        if (x < cameraOffset.x || x >= cameraOffset.x + VIEWPORT_W) return
        const px = (x - cameraOffset.x) * TILE_SIZE
        const py = (y - cameraOffset.y) * TILE_SIZE
        switch (tile) {
          case 'T': drawTree(ctx, px, py); break
          case 'P':
          case 'D':
          case 'S': drawPath(ctx, px, py); break
          default:  drawGrass(ctx, px, py)
        }
      })
    })

    // Draw buildings on top of tiles (only if visible)
    BUILDING_DOORS.forEach(door => {
      const bx = door.tileX - 1
      const by = door.tileY - 2
      // Building spans 3 wide, 3 tall (2 wall rows + door row)
      if (bx + 3 < cameraOffset.x || bx >= cameraOffset.x + VIEWPORT_W) return
      if (by + 3 < cameraOffset.y || by >= cameraOffset.y + VIEWPORT_H) return
      // Temporarily adjust door coords for camera offset drawing
      const offsetDoor = {
        ...door,
        tileX: door.tileX - cameraOffset.x,
        tileY: door.tileY - cameraOffset.y,
      }
      drawBuilding(ctx, offsetDoor)
    })

    // Draw NPCs (only if visible)
    NPC_SPAWNS.forEach(npc => {
      if (npc.tileX < cameraOffset.x || npc.tileX >= cameraOffset.x + VIEWPORT_W) return
      if (npc.tileY < cameraOffset.y || npc.tileY >= cameraOffset.y + VIEWPORT_H) return
      const offsetNpc = {
        ...npc,
        tileX: npc.tileX - cameraOffset.x,
        tileY: npc.tileY - cameraOffset.y,
      }
      drawNPC(ctx, offsetNpc, spritesRef.current[npc.id] ?? null)
    })

    // Draw player on top of everything
    const playerPx = (playerPos.x - cameraOffset.x) * TILE_SIZE
    const playerPy = (playerPos.y - cameraOffset.y) * TILE_SIZE
    drawPlayer(ctx, playerPx, playerPy, facing, stepCount)

  }, [playerPos, facing, projects, spritesLoaded, stepCount, cameraOffset])

  return (
    <canvas
      ref={canvasRef}
      width={15 * TILE_SIZE}
      height={11 * TILE_SIZE}
      className="block max-w-full mx-auto"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
