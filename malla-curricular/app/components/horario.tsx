"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Subject {
  id: string
  code: string
  name: string
  hours: number
  sct: number
  completed: boolean
}

interface Level {
  level: number
  subjects: Subject[]
}

interface ScheduleItem {
  id: string
  subjectId: string
  subjectCode: string
  subjectName: string
  day: string
  startTime: string
  endTime: string
}

interface HorarioProps {
  levels: Level[]
  schedule: ScheduleItem[]
  setSchedule: (schedule: ScheduleItem[]) => void
}

export default function Horario({ levels, schedule, setSchedule }: HorarioProps) {
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false)
  const [newScheduleItem, setNewScheduleItem] = useState({
    subjectId: "",
    day: "",
    startTime: "",
    endTime: "",
  })

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  const hours = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8 // Start from 8 AM
    return `${hour.toString().padStart(2, "0")}:00`
  })

  // Get all subjects from all levels, excluding completed ones, and sort by level
  const availableSubjects = levels
    .flatMap((level) =>
      level.subjects
        .filter((subject) => !subject.completed) // Only show non-completed subjects
        .map((subject) => ({
          ...subject,
          levelNumber: level.level, // Add level number for sorting
        })),
    )
    .sort((a, b) => {
      // First sort by level, then by code
      if (a.levelNumber !== b.levelNumber) {
        return a.levelNumber - b.levelNumber
      }
      return a.code.localeCompare(b.code)
    })

  const addScheduleItem = () => {
    if (!newScheduleItem.subjectId || !newScheduleItem.day || !newScheduleItem.startTime || !newScheduleItem.endTime) {
      alert("Por favor completa todos los campos")
      return
    }

    const subject = availableSubjects.find((s) => s.id === newScheduleItem.subjectId)
    if (!subject) {
      alert("Ramo no encontrado")
      return
    }

    const scheduleItem: ScheduleItem = {
      id: Date.now().toString(),
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      day: newScheduleItem.day,
      startTime: newScheduleItem.startTime,
      endTime: newScheduleItem.endTime,
    }

    setSchedule([...schedule, scheduleItem])
    setNewScheduleItem({
      subjectId: "",
      day: "",
      startTime: "",
      endTime: "",
    })
    setIsAddScheduleOpen(false)
  }

  const removeScheduleItem = (id: string) => {
    setSchedule(schedule.filter((item) => item.id !== id))
  }

  const getScheduleForDayAndHour = (day: string, hour: string) => {
    return schedule.find((item) => {
      const itemHour = Number.parseInt(item.startTime.split(":")[0])
      const currentHour = Number.parseInt(hour.split(":")[0])
      const endHour = Number.parseInt(item.endTime.split(":")[0])

      return item.day === day && currentHour >= itemHour && currentHour < endHour
    })
  }

  const getItemHeight = (item: ScheduleItem) => {
    const startHour = Number.parseInt(item.startTime.split(":")[0])
    const endHour = Number.parseInt(item.endTime.split(":")[0])
    return (endHour - startHour) * 60 // 60px per hour
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mi Horario
            </h1>
          </div>
          <p className="text-gray-600">Organiza tus clases semanales</p>
        </motion.div>

        {/* Controls */}
        <div className="flex justify-center mb-6">
          <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Clase
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar Clase al Horario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Ramo</Label>
                  <Select
                    value={newScheduleItem.subjectId}
                    onValueChange={(value) => setNewScheduleItem({ ...newScheduleItem, subjectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un ramo" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableSubjects.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          No hay ramos disponibles
                          <br />
                          <span className="text-xs">Los ramos aprobados no se muestran</span>
                        </div>
                      ) : (
                        availableSubjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {subject.code} - {subject.name}
                              </span>
                              <span className="text-xs text-gray-500">Nivel {subject.levelNumber}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="day">Día</Label>
                  <Select
                    value={newScheduleItem.day}
                    onValueChange={(value) => setNewScheduleItem({ ...newScheduleItem, day: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el día" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Hora Inicio</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newScheduleItem.startTime}
                      onChange={(e) => setNewScheduleItem({ ...newScheduleItem, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">Hora Fin</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newScheduleItem.endTime}
                      onChange={(e) => setNewScheduleItem({ ...newScheduleItem, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addScheduleItem} className="flex-1" disabled={availableSubjects.length === 0}>
                    Agregar
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddScheduleOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* No subjects message */}
        {availableSubjects.length === 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-6">
            <CardContent className="p-8 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay ramos disponibles</h3>
              <p className="text-gray-500">
                Todos los ramos en tu malla curricular están marcados como aprobados.
                <br />
                Solo se muestran los ramos pendientes para agregar al horario.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Schedule Grid */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Horario Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-1">
              {/* Header */}
              <div className="p-2 font-semibold text-center bg-gray-100 rounded">Hora</div>
              {days.map((day) => (
                <div key={day} className="p-2 font-semibold text-center bg-gray-100 rounded">
                  {day}
                </div>
              ))}

              {/* Time slots */}
              {hours.map((hour) => (
                <>
                  <div key={hour} className="p-2 text-sm text-center bg-gray-50 rounded font-mono">
                    {hour}
                  </div>
                  {days.map((day) => {
                    const scheduleItem = getScheduleForDayAndHour(day, hour)
                    const isFirstHour =
                      scheduleItem &&
                      hour === `${Number.parseInt(scheduleItem.startTime.split(":")[0]).toString().padStart(2, "0")}:00`

                    return (
                      <div key={`${day}-${hour}`} className="relative">
                        {scheduleItem && isFirstHour ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded p-1 text-xs group cursor-pointer"
                            style={{ height: `${getItemHeight(scheduleItem)}px`, zIndex: 10 }}
                          >
                            <div className="font-semibold">{scheduleItem.subjectCode}</div>
                            <div className="text-xs opacity-90 truncate">{scheduleItem.subjectName}</div>
                            <div className="text-xs opacity-75">
                              {scheduleItem.startTime} - {scheduleItem.endTime}
                            </div>
                            <button
                              onClick={() => removeScheduleItem(scheduleItem.id)}
                              className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ) : !scheduleItem ? (
                          <div className="h-14 border border-gray-200 rounded bg-white/50"></div>
                        ) : null}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Summary */}
        {schedule.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Resumen del Horario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedule.map((item) => (
                    <div key={item.id} className="bg-white/50 rounded-lg p-3 border">
                      <div className="font-semibold text-indigo-600">{item.subjectCode}</div>
                      <div className="text-sm text-gray-600 mb-1">{item.subjectName}</div>
                      <div className="text-xs text-gray-500">
                        {item.day} • {item.startTime} - {item.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
