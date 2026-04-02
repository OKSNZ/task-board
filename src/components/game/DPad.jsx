export default function DPad({ onMove }) {
  const btn = (dir, label) => (
    <button
      onPointerDown={(e) => { e.preventDefault(); onMove(dir) }}
      className="w-12 h-12 bg-gray-800 border border-gray-600 rounded flex items-center justify-center text-white font-bold text-lg active:bg-gray-600 select-none touch-none"
      aria-label={dir}
    >
      {label}
    </button>
  )
  return (
    <div className="grid grid-cols-3 gap-1 w-fit">
      <div />{btn('up', '\u25B2')}<div />
      {btn('left', '\u25C4')}<div className="w-12 h-12" />{btn('right', '\u25BA')}
      <div />{btn('down', '\u25BC')}<div />
    </div>
  )
}
