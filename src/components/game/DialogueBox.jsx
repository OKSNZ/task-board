import { useState, useEffect, useCallback } from 'react'

export default function DialogueBox({ lines, onClose }) {
  const [page, setPage] = useState(0)

  const advance = useCallback(() => {
    if (page < lines.length - 1) setPage(p => p + 1)
    else onClose()
  }, [page, lines.length, onClose])

  // Keyboard: Space/Enter/E to advance
  useEffect(() => {
    const handler = (e) => {
      if (['Space', 'Enter', 'KeyE'].includes(e.code)) {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advance])

  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 dialogue-slide-up">
      <div className="bg-poke-dark border-2 border-poke-yellow rounded-lg p-4 max-w-xl mx-auto">
        <p className="text-white text-sm leading-relaxed min-h-[3rem]">
          {lines[page]}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-pixel text-gray-500 text-[8px]">
            {page + 1}/{lines.length}
          </span>
          <button
            onClick={advance}
            className="font-pixel text-poke-yellow text-[10px] border border-poke-yellow/40 px-3 py-1 rounded hover:bg-poke-yellow/10 cursor-pointer"
          >
            {page < lines.length - 1 ? 'NEXT ▶' : 'CLOSE ▶'}
          </button>
        </div>
      </div>
    </div>
  )
}
