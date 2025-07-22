"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CalendarIcon, Plus, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CalendarEvent {
  id: string
  date: string
  title: string
  description?: string
}

interface CalendarioAcademicoProps {
  events: CalendarEvent[]
  setEvents: (events: CalendarEvent[]) => void
}

export default function CalendarioAcademico({ events, setEvents }: CalendarioAcademicoProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
  })

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getEventsForDate = (date: Date) => {
    const dateString = formatDate(date)
    return events.filter((event) => event.date === dateString)
  }

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      alert("Por favor completa el título y la fecha")
      return
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
    }

    setEvents([...events, event])
    setNewEvent({
      title: "",
      description: "",
      date: "",
    })
    setIsAddEventOpen(false)
  }

  const removeEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id))
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const openAddEventDialog = (date?: Date) => {
    if (date) {
      setNewEvent((prev) => ({ ...prev, date: formatDate(date) }))
    }
    setIsAddEventOpen(true)
  }

  const days = getDaysInMonth(currentDate)

  // Función para formatear correctamente la fecha en español
  const formatLocalDate = (dateString: string) => {
    // Crear una nueva fecha a partir del string y asegurarse de que se interprete como UTC
    const date = new Date(dateString)

    // Ajustar la zona horaria para evitar problemas con el día
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)

    return localDate.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Calendario Académico
            </h1>
          </div>
          <p className="text-gray-600">Organiza tus pruebas, tareas y eventos importantes</p>
        </motion.div>

        {/* Calendar Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="outline" onClick={() => navigateMonth("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Evento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título del Evento</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Ej: Prueba de Matemáticas"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción (Opcional)</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Detalles adicionales del evento..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addEvent} className="flex-1">
                    Agregar Evento
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddEventOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calendar Grid */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-100 rounded">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="h-24"></div>
                }

                const dayEvents = getEventsForDate(day)
                const isToday = formatDate(day) === formatDate(new Date())

                return (
                  <motion.div
                    key={day.getDate()}
                    whileHover={{ scale: 1.02 }}
                    className={`h-24 p-2 border rounded-lg cursor-pointer transition-all ${
                      isToday ? "bg-indigo-100 border-indigo-300" : "bg-white/50 border-gray-200 hover:bg-white/80"
                    }`}
                    onClick={() => openAddEventDialog(day)}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isToday ? "text-indigo-600" : "text-gray-700"}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs bg-indigo-500 text-white rounded px-1 py-0.5 truncate group relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {event.title}
                          <button
                            onClick={() => removeEvent(event.id)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      ))}
                      {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} más</div>}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        {events.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-white/50 rounded-lg border group"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{event.title}</div>
                          <div className="text-sm text-gray-600">{formatLocalDate(event.date)}</div>
                          {event.description && <div className="text-xs text-gray-500 mt-1">{event.description}</div>}
                        </div>
                        <button
                          onClick={() => removeEvent(event.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
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
