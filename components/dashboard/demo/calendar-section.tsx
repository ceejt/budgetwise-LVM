"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { CalendarTask } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CalendarSectionProps {
  tasks: CalendarTask[]
  setTasks: (tasks: CalendarTask[]) => void
}

export function CalendarSection({ tasks, setTasks }: CalendarSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split("T")[0])

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    const newTask: CalendarTask = {
      id: `task-${Date.now()}`,
      user_id: "demo-user-123",
      title: taskTitle,
      date: taskDate,
      completed: false,
      created_at: new Date().toISOString(),
    }
    setTasks([...tasks, newTask])
    setDialogOpen(false)
    setTaskTitle("")
    setTaskDate(new Date().toISOString().split("T")[0])
  }

  const daysInMonth = 31
  const currentDate = new Date().getDate()

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📅</span>
          <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
            Calendar
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-transparent"
          style={{ borderColor: "#E0E0E0", color: "#293F55" }}
          onClick={() => setDialogOpen(true)}
        >
          Add Task
        </Button>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2" style={{ color: "#293F55" }}>
          JULY
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm text-gray-500">
              {day}
            </div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const hasTask = tasks.some((t) => new Date(t.date).getDate() === day)
            return (
              <div
                key={day}
                className="aspect-square flex items-center justify-center text-sm rounded-lg hover:bg-gray-100 cursor-pointer relative"
                style={{
                  color: "#293F55",
                  backgroundColor: day === currentDate ? "#72ADFD20" : "transparent",
                }}
              >
                {day}
                {hasTask && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full" style={{ backgroundColor: "#72ADFD" }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2" style={{ color: "#293F55" }}>
            Upcoming Tasks
          </h4>
          <div className="space-y-2">
            {tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {
                    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)))
                  }}
                  className="rounded"
                />
                <span className={task.completed ? "line-through text-gray-400" : ""}>{task.title}</span>
                <span className="text-gray-400 text-xs ml-auto">{new Date(task.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>Create a new task or reminder</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="e.g., Pay tuition fee"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-date">Date</Label>
              <Input
                id="task-date"
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: "#72ADFD" }}>
              Add Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
