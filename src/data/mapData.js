// Village map: 20 wide x 15 tall
// Top row = trees, paths between buildings, trees as borders
// Buildings in two rows (y=1-3 and y=4-6 and y=7-9), paths between

export const MAP_TILES = [
  // Row 0: tree border across the top
  ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
  // Row 1: building walls row 1 (top of buildings)
  ['T','W','W','W','W','T','T','W','W','W','W','T','T','W','W','W','W','T','T','T'],
  // Row 2: building walls row 1 (NPCs + windows)
  ['T','W','N','W','W','T','T','W','W','W','W','T','T','W','N','W','W','T','T','T'],
  // Row 3: doors for row 1 buildings
  ['T','P','P','D','P','P','P','P','P','D','P','P','P','P','P','D','P','P','T','T'],
  // Row 4: building walls row 2 (top)
  ['T','W','W','W','W','T','T','W','W','W','W','T','T','W','W','W','W','T','T','T'],
  // Row 5: building walls row 2 (NPC)
  ['T','W','N','W','W','T','T','W','W','W','W','T','T','W','W','W','W','T','T','T'],
  // Row 6: doors for row 2 buildings
  ['T','P','P','D','P','P','P','P','P','D','P','P','P','P','P','D','P','P','T','T'],
  // Row 7: building walls row 3 (top)
  ['T','W','W','W','W','T','T','G','G','G','G','G','G','G','G','G','G','G','T','T'],
  // Row 8: building walls row 3 (NPC + professor)
  ['T','W','N','W','W','T','T','G','G','G','N','G','G','G','G','G','G','G','T','T'],
  // Row 9: doors for row 3 + player spawn area
  ['T','P','P','D','P','P','P','P','P','P','S','P','P','P','P','P','P','P','T','T'],
  // Row 10: open grass area / village square
  ['T','G','G','P','G','G','G','G','P','P','P','P','P','G','G','G','G','G','T','T'],
  // Row 11: grass with paths
  ['T','G','G','P','G','G','G','G','P','G','G','G','P','G','G','G','G','G','T','T'],
  // Row 12: grass
  ['T','G','G','P','P','P','P','P','P','G','G','G','P','P','P','P','G','G','T','T'],
  // Row 13: grass with trees
  ['T','T','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','T','T','T'],
  // Row 14: tree border across the bottom
  ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
]

export const TILE_SIZE = 32

export const NPC_SPAWNS = [
  { id: 'professor', tileX: 10, tileY: 8, role: 'PROFESSOR MAPLE' },
  { id: 'sage', tileX: 14, tileY: 2, role: 'SAGE' },
  { id: 'admaster', tileX: 2, tileY: 2, role: 'AD MASTER' },
  { id: 'chief', tileX: 2, tileY: 5, role: 'CHIEF' },
  { id: 'analyst', tileX: 2, tileY: 8, role: 'ANALYST' },
]

export const BUILDING_DOORS = [
  { tileX: 3, tileY: 3, projectId: 'ppc-landing', label: 'PPC LANDING' },
  { tileX: 9, tileY: 3, projectId: 'gtm-n8n', label: 'GTM ENGINE' },
  { tileX: 15, tileY: 3, projectId: 'youtube-seo', label: 'YOUTUBE SEO' },
  { tileX: 3, tileY: 6, projectId: 'paddle-website', label: 'PADDLE', locked: true },
  { tileX: 9, tileY: 6, projectId: null, label: 'POKEMON CENTRE' },
  { tileX: 15, tileY: 6, projectId: 'hs-chatbot', label: 'H&S CHATBOT', locked: true },
  { tileX: 3, tileY: 9, projectId: 'ads-dashboard', label: 'ADS DASH', locked: true },
]

export const PLAYER_SPAWN = { tileX: 10, tileY: 9 }
