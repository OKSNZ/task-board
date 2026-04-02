import { useCallback, useMemo, useState } from 'react'
import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import ProjectCard from './ProjectCard'

function ColumnHeader({ title, count, colour }) {
  const colourClasses = {
    red: 'text-poke-red border-poke-red/30',
    grey: 'text-gray-400 border-gray-600',
    green: 'text-green-400 border-green-500/30',
  }

  return (
    <div className={`flex items-center justify-between border-b pb-2 mb-4 ${colourClasses[colour]}`}>
      <h2 className="font-pixel text-xs m-0 leading-relaxed">
        {title}
      </h2>
      <span className="font-pixel text-[10px] opacity-60">
        {count}
      </span>
    </div>
  )
}

export default function ProjectBoard({ activeProjects, parkedProjects, doneProjects, onComplete, onReorder, onBreakdown }) {
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const allProjects = useMemo(
    () => [...activeProjects, ...parkedProjects, ...doneProjects],
    [activeProjects, parkedProjects, doneProjects]
  )

  const findTaskProject = useCallback((taskId) => {
    return allProjects.find((p) => p.tasks.some((t) => t.id === taskId))
  }, [allProjects])

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragEnd = useCallback((event) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeProject = findTaskProject(active.id)
    const overProject = findTaskProject(over.id)

    if (!activeProject || !overProject) return
    if (activeProject.id !== overProject.id) return

    const oldIndex = activeProject.tasks.findIndex((t) => t.id === active.id)
    const newIndex = activeProject.tasks.findIndex((t) => t.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      onReorder(activeProject.id, oldIndex, newIndex)
    }
  }, [findTaskProject, onReorder])

  const activeTask = activeId
    ? allProjects.flatMap((p) => p.tasks).find((t) => t.id === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active column */}
        <div>
          <ColumnHeader title="ACTIVE" count={activeProjects.length} colour="red" />
          <div className="flex flex-col gap-4">
            {activeProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                status="active"
                onComplete={onComplete}
                onBreakdown={onBreakdown}
              />
            ))}
            {activeProjects.length === 0 && (
              <p className="text-gray-500 text-sm text-center italic py-8">
                No active quests - time to unpark something!
              </p>
            )}
          </div>
        </div>

        {/* Parked column */}
        <div>
          <ColumnHeader title="PARKED" count={parkedProjects.length} colour="grey" />
          <div className="flex flex-col gap-4">
            {parkedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                status="parked"
                onComplete={onComplete}
              />
            ))}
            {parkedProjects.length === 0 && (
              <p className="text-gray-500 text-sm text-center italic py-8">
                Nothing parked - all systems go!
              </p>
            )}
          </div>
        </div>

        {/* Done column */}
        <div>
          <ColumnHeader title="DONE" count={doneProjects.length} colour="green" />
          <div className="flex flex-col gap-4">
            {doneProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                status="done"
                onComplete={onComplete}
              />
            ))}
            {doneProjects.length === 0 && (
              <p className="text-gray-500 text-sm text-center italic py-8">
                Complete a project to fill this column!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="bg-poke-card border border-poke-yellow/30 rounded px-3 py-2 text-sm text-gray-200 shadow-lg">
            {activeTask.text}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
