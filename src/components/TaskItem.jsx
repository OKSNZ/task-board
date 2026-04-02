import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function TaskItem({ task, projectId, onComplete, onBreakdown, disabled, isActive }) {
  const [justCompleted, setJustCompleted] = useState(false)
  const [isBreaking, setIsBreaking] = useState(false)
  const [breakError, setBreakError] = useState(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: disabled || task.completed })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleChange = () => {
    if (task.completed || disabled) return
    setJustCompleted(true)
    onComplete(projectId, task.id)
    setTimeout(() => setJustCompleted(false), 600)
  }

  const handleBreakdown = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!onBreakdown) return
    setIsBreaking(true)
    setBreakError(null)
    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskText: task.text }),
      })
      const data = await res.json()
      if (data.microTasks) {
        onBreakdown(projectId, task.id, data.microTasks)
      } else {
        setBreakError('Could not break down')
        setTimeout(() => setBreakError(null), 2000)
      }
    } catch {
      setBreakError('No connection')
      setTimeout(() => setBreakError(null), 2000)
    } finally {
      setIsBreaking(false)
    }
  }

  const showBreakdownButton = onBreakdown && !task.completed && !disabled && isActive

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'dragging' : ''}`}
    >
      <label
        className={`
          group relative flex items-center gap-2 px-3 py-2 rounded cursor-pointer
          transition-colors duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${task.completed ? 'opacity-70' : 'hover:bg-white/5'}
          ${justCompleted ? 'task-just-completed' : ''}
        `}
      >
        {/* Drag handle */}
        {!disabled && !task.completed && (
          <span
            className="drag-handle flex-shrink-0 text-gray-600 hover:text-gray-400 text-xs select-none"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            &#x2807;
          </span>
        )}

        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleChange}
          disabled={task.completed || disabled}
          className="sr-only"
        />
        {/* Custom checkbox */}
        <span
          className={`
            flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
            transition-colors duration-200
            ${task.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-500 hover:border-poke-yellow'
            }
          `}
          aria-hidden="true"
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span
          className={`text-sm flex-1 ${task.completed ? 'line-through text-green-400' : 'text-gray-200'}`}
        >
          {task.text}
        </span>

        {/* Breakdown button */}
        {showBreakdownButton && (
          <button
            onClick={handleBreakdown}
            disabled={isBreaking}
            className="font-pixel text-[8px] text-poke-yellow opacity-0 group-hover:opacity-100 transition-opacity px-1 py-0.5 border border-poke-yellow/30 rounded hover:bg-poke-yellow/10 bg-transparent cursor-pointer flex-shrink-0"
            aria-label="Break down task"
            type="button"
          >
            {isBreaking ? (
              <span className="inline-block w-3 h-3 border border-poke-yellow border-t-transparent rounded-full break-spin" />
            ) : (
              'BREAK DOWN'
            )}
          </button>
        )}

        {/* Break error */}
        {breakError && (
          <span className="font-pixel text-[7px] text-red-400 absolute right-2 -bottom-3">
            {breakError}
          </span>
        )}

        {/* XP flash */}
        {justCompleted && (
          <span className="xp-flash absolute right-2 top-0 font-pixel text-poke-yellow text-xs">
            +25 XP
          </span>
        )}
      </label>
    </div>
  )
}
