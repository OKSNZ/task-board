import { useState } from 'react'

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

function deriveStatus(project) {
  if (project.status === 'parked') return 'parked'
  if (project.tasks.length > 0 && project.tasks.every((t) => t.completed)) return 'done'
  return 'active'
}

const STARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 23 + 7) % 40}%`,
  delay: `${(i * 0.7) % 3}s`,
  size: i % 3 === 0 ? 2 : 1,
}))

function Building({ project, status, onClick }) {
  const wallColour = status === 'done' ? '#1a3a1a' : status === 'parked' ? '#1a1a1a' : '#2a2a4e'
  const roofColour = status === 'done' ? '#22553a' : status === 'parked' ? '#2a2a2a' : '#3a3a6e'
  const windowGlowStyle = status === 'active'
    ? { boxShadow: '0 0 6px #ffcb05', background: '#ffcb05' }
    : status === 'done'
      ? { boxShadow: '0 0 6px #22c55e', background: '#22c55e' }
      : { background: '#333' }

  const spriteUrl = `${SPRITE_BASE}/${project.pokemonId || 132}.png`

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none p-2 focus:outline-none focus:ring-2 focus:ring-poke-yellow/50 rounded"
      aria-label={`${project.title} - ${status}`}
    >
      {/* Pokemon floating above */}
      <img
        src={spriteUrl}
        alt=""
        className="w-8 h-8 poke-float"
        style={{ imageRendering: 'pixelated' }}
        onError={(e) => { e.target.style.display = 'none' }}
      />

      {/* Roof - triangle */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '32px solid transparent',
          borderRight: '32px solid transparent',
          borderBottom: `20px solid ${roofColour}`,
        }}
      />

      {/* Walls */}
      <div
        style={{
          width: 56,
          height: 40,
          background: wallColour,
          position: 'relative',
          borderRadius: '0 0 2px 2px',
          marginTop: -1,
        }}
      >
        {/* Windows */}
        <div className="absolute top-2 left-2 flex gap-2">
          <div
            className={status !== 'parked' ? 'window-glow' : ''}
            style={{ width: 8, height: 8, borderRadius: 1, ...windowGlowStyle }}
          />
          <div
            className={status !== 'parked' ? 'window-glow' : ''}
            style={{ width: 8, height: 8, borderRadius: 1, animationDelay: '1s', ...windowGlowStyle }}
          />
        </div>

        {/* Door */}
        <div
          style={{
            width: 10,
            height: 14,
            background: status === 'parked' ? '#111' : '#1a1a3e',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '2px 2px 0 0',
          }}
        />
      </div>

      {/* Title */}
      <span className="font-pixel text-[6px] text-gray-400 max-w-[64px] truncate leading-relaxed mt-1">
        {project.title}
      </span>
    </button>
  )
}

function VillageModal({ project, onClose, onComplete }) {
  const status = deriveStatus(project)

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-label={project.title}>
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 bg-poke-card border-2 border-poke-yellow/30 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-pixel text-poke-yellow text-xs leading-relaxed m-0">{project.title}</h3>
          <button
            onClick={onClose}
            className="font-pixel text-gray-400 hover:text-white text-xs bg-transparent border-none cursor-pointer p-1"
            aria-label="Close"
          >
            X
          </button>
        </div>

        {project.tasks.length === 0 && (
          <p className="text-gray-500 text-sm italic">No tasks</p>
        )}

        <div className="flex flex-col gap-1">
          {project.tasks.map((task) => (
            <label
              key={task.id}
              className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors duration-200 ${
                task.completed ? 'opacity-70' : 'hover:bg-white/5'
              } ${status === 'parked' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => {
                  if (!task.completed && status !== 'parked') {
                    onComplete(project.id, task.id)
                  }
                }}
                disabled={task.completed || status === 'parked'}
                className="sr-only"
              />
              <span
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                  task.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-500 hover:border-poke-yellow'
                }`}
              >
                {task.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={`text-sm ${task.completed ? 'line-through text-green-400' : 'text-gray-200'}`}>
                {task.text}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function VillageView({ projects, onComplete }) {
  const [selectedProject, setSelectedProject] = useState(null)

  return (
    <div
      className="relative rounded-lg overflow-hidden border border-gray-700"
      style={{
        background: 'linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 60%, #1a3a1a 85%, #0f2e0f 100%)',
        minHeight: 320,
      }}
    >
      {/* Stars */}
      {STARS.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white star-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}

      {/* Buildings */}
      <div className="relative z-10 flex flex-wrap justify-center items-end gap-4 sm:gap-6 px-4 pt-16 pb-6" style={{ minHeight: 280 }}>
        {projects.map((project) => (
          <Building
            key={project.id}
            project={project}
            status={deriveStatus(project)}
            onClick={() => setSelectedProject(project)}
          />
        ))}
      </div>

      {/* Ground strip */}
      <div className="absolute bottom-0 left-0 right-0 h-6" style={{ background: '#0f2e0f' }} />

      {/* Modal */}
      {selectedProject && (
        <VillageModal
          project={projects.find((p) => p.id === selectedProject.id) || selectedProject}
          onClose={() => setSelectedProject(null)}
          onComplete={onComplete}
        />
      )}
    </div>
  )
}
