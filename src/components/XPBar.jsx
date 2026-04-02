export default function XPBar({ current, max }) {
  const percentage = Math.min((current / max) * 100, 100)

  return (
    <div className="w-full" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={max} aria-label="Experience points progress">
      {/* Outer casing - dark with border like a Pokemon HP bar */}
      <div className="relative h-6 rounded-sm border-2 border-gray-600 bg-gray-900 overflow-hidden">
        {/* Inner track with slight inset */}
        <div className="absolute inset-[2px] rounded-sm bg-gray-800 overflow-hidden">
          {/* Red fill */}
          <div
            className="xp-bar-fill h-full rounded-sm transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Highlight line across top for depth */}
        <div className="absolute top-[3px] left-[3px] right-[3px] h-[2px] bg-white/10 rounded-sm" />
      </div>
    </div>
  )
}
