import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskItem from './TaskItem'

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

function StatusBadge({ status, completedCount, totalCount }) {
  if (status === 'done') {
    return (
      <span className="font-pixel text-[10px] px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
        COMPLETE
      </span>
    )
  }
  if (status === 'parked') {
    return (
      <span className="font-pixel text-[10px] px-2 py-1 rounded bg-gray-500/20 text-gray-400 border border-gray-500/30">
        PARKED
      </span>
    )
  }
  return (
    <span className="font-pixel text-[10px] px-2 py-1 rounded bg-poke-red/20 text-poke-red border border-poke-red/30">
      {completedCount}/{totalCount}
    </span>
  )
}

export default function ProjectCard({ project, status, onComplete, onBreakdown }) {
  const isParked = status === 'parked'
  const isDone = status === 'done'
  const isActive = status === 'active'
  const completedCount = project.tasks.filter((t) => t.completed).length
  const totalCount = project.tasks.length

  const spriteUrl = project.pokemonId
    ? `${SPRITE_BASE}/${project.pokemonId}.png`
    : null

  const taskIds = project.tasks.map((t) => t.id)

  return (
    <div
      className={`
        rounded-lg border p-4 transition-all duration-200
        ${isParked
          ? 'border-gray-700 bg-gray-800/40 opacity-60'
          : isDone
            ? 'border-green-500/30 bg-poke-card'
            : 'border-poke-card-light bg-poke-card hover:border-poke-yellow/20'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {spriteUrl && (
            <img
              src={spriteUrl}
              alt={project.title}
              className="poke-sprite w-8 h-8 flex-shrink-0"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          )}
          {isParked && !spriteUrl && <span className="text-gray-500 flex-shrink-0" aria-label="Locked">&#x1F512;</span>}
          {isDone && !spriteUrl && <span className="flex-shrink-0" aria-label="Complete">&#x26AA;</span>}
          <h3 className="font-pixel text-xs text-white truncate m-0 leading-relaxed">
            {project.title}
          </h3>
        </div>
        <StatusBadge status={status} completedCount={completedCount} totalCount={totalCount} />
      </div>

      {/* Blocked reason for parked */}
      {isParked && project.blocked && (
        <p className="text-xs text-gray-500 italic mb-0">
          {project.blocked}
        </p>
      )}

      {/* Tasks */}
      {!isParked && project.tasks.length > 0 && (
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1">
            {project.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projectId={project.id}
                onComplete={onComplete}
                onBreakdown={onBreakdown}
                disabled={isDone}
                isActive={isActive}
              />
            ))}
          </div>
        </SortableContext>
      )}

      {/* Progress bar for active projects */}
      {!isParked && totalCount > 0 && (
        <div className="mt-3 h-1 rounded-full bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-poke-red transition-all duration-500"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
