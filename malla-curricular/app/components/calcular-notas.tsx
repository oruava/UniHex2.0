"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calculator, Plus, X, AlertCircle, CheckCircle, Settings, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface ScheduleItem {
  id: string
  subjectId: string
  subjectCode: string
  subjectName: string
  day: string
  startTime: string
  endTime: string
}

interface Grade {
  id: string
  name: string
  percentage: number
  score?: number
}

interface SubjectGrades {
  subjectId: string
  grades: Grade[]
}

interface CalcularNotasProps {
  schedule: ScheduleItem[]
  subjectGrades: SubjectGrades[]
  setSubjectGrades: (grades: SubjectGrades[]) => void
  minPassingGrade: number
  setMinPassingGrade: (grade: number) => void
  minExamGrade: number
  setMinExamGrade: (grade: number) => void
}

export default function CalcularNotas({
  schedule,
  subjectGrades,
  setSubjectGrades,
  minPassingGrade,
  setMinPassingGrade,
  minExamGrade,
  setMinExamGrade,
}: CalcularNotasProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false)
  const [newGrade, setNewGrade] = useState({
    name: "",
    percentage: "",
    score: "",
  })

  const [isSettingsOpen, setIsSettingsOpen] = useState(false) // State for settings dialog
  const [tempMinPassingGrade, setTempMinPassingGrade] = useState(minPassingGrade.toFixed(2))
  const [tempMinExamGrade, setTempMinExamGrade] = useState(minExamGrade.toFixed(2))
  const [settingsSaved, setSettingsSaved] = useState(false)

  // Update temp grades when props change (e.g., on initial load or user logout/login)
  useState(() => {
    setTempMinPassingGrade(minPassingGrade.toFixed(2))
    setTempMinExamGrade(minExamGrade.toFixed(2))
  }, [minPassingGrade, minExamGrade])

  // Get unique subjects from schedule
  const subjects = schedule.reduce(
    (acc, item) => {
      if (!acc.find((s) => s.id === item.subjectId)) {
        acc.push({
          id: item.subjectId,
          code: item.subjectCode,
          name: item.subjectName,
        })
      }
      return acc
    },
    [] as Array<{ id: string; code: string; name: string }>,
  )

  const getSubjectGrades = (subjectId: string) => {
    return subjectGrades.find((sg) => sg.subjectId === subjectId)?.grades || []
  }

  const addGrade = () => {
    if (!selectedSubjectId || !newGrade.name || !newGrade.percentage) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    const percentage = Number.parseFloat(newGrade.percentage)
    if (percentage <= 0 || percentage > 100) {
      alert("El porcentaje debe estar entre 1 y 100")
      return
    }

    const score = newGrade.score ? Number.parseFloat(newGrade.score) : undefined
    if (score !== undefined && (score < 1 || score > 7)) {
      alert("La nota debe estar entre 1.0 y 7.0")
      return
    }

    const grade: Grade = {
      id: Date.now().toString(),
      name: newGrade.name,
      percentage: percentage,
      score: score,
    }

    const existingSubjectGrades = subjectGrades.find((sg) => sg.subjectId === selectedSubjectId)

    if (existingSubjectGrades) {
      setSubjectGrades(
        subjectGrades.map((sg) => (sg.subjectId === selectedSubjectId ? { ...sg, grades: [...sg.grades, grade] } : sg)),
      )
    } else {
      setSubjectGrades([...subjectGrades, { subjectId: selectedSubjectId, grades: [grade] }])
    }

    setNewGrade({
      name: "",
      percentage: "",
      score: "",
    })
    setIsAddGradeOpen(false)
  }

  const removeGrade = (subjectId: string, gradeId: string) => {
    setSubjectGrades(
      subjectGrades
        .map((sg) => (sg.subjectId === subjectId ? { ...sg, grades: sg.grades.filter((g) => g.id !== gradeId) } : sg))
        .filter((sg) => sg.grades.length > 0),
    )
  }

  const updateGradeScore = (subjectId: string, gradeId: string, score: string) => {
    const numScore = score ? Number.parseFloat(score) : undefined
    if (numScore !== undefined && (numScore < 1 || numScore > 7)) {
      return // Prevent invalid score updates
    }

    setSubjectGrades(
      subjectGrades.map((sg) =>
        sg.subjectId === subjectId
          ? {
              ...sg,
              grades: sg.grades.map((g) => (g.id === gradeId ? { ...g, score: numScore } : g)),
            }
          : sg,
      ),
    )
  }

  const handleSaveSettings = () => {
    const passing = Number.parseFloat(tempMinPassingGrade)
    const exam = Number.parseFloat(tempMinExamGrade)

    if (isNaN(passing) || passing < 1 || passing > 7) {
      alert("La nota mínima para aprobar debe estar entre 1.0 y 7.0")
      return
    }
    if (isNaN(exam) || exam < 1 || exam > 7) {
      alert("La nota mínima para ir a examen debe estar entre 1.0 y 7.0")
      return
    }
    if (exam >= passing) {
      alert("La nota mínima para examen debe ser menor que la nota mínima para aprobar.")
      return
    }

    setMinPassingGrade(passing)
    setMinExamGrade(exam)
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2000)
    setIsSettingsOpen(false) // Close dialog after saving
  }

  const calculateSubjectStats = (subjectId: string) => {
    const grades = getSubjectGrades(subjectId)
    const totalPercentage = grades.reduce((sum, grade) => sum + grade.percentage, 0)
    const gradesWithScores = grades.filter((g) => g.score !== undefined)

    let currentPoints = gradesWithScores.reduce((sum, grade) => sum + (grade.score! * grade.percentage) / 100, 0)
    currentPoints = Number.parseFloat(currentPoints.toFixed(2)) // Fix floating point issues

    const remainingPercentage = 100 - totalPercentage
    const remainingGrades = grades.filter((g) => g.score === undefined)
    const percentageOfRemainingGrades = remainingGrades.reduce((sum, grade) => sum + grade.percentage, 0)

    let finalStatus: "Aprobado" | "A Examen" | "Reprobado" | "Pendiente" | "Error" = "Pendiente"
    let message = ""
    let minNeededToPass: number | null = null
    let minNeededToExam: number | null = null

    if (totalPercentage === 100 && gradesWithScores.length === grades.length) {
      // All grades entered and percentages sum to 100%
      if (currentPoints >= minPassingGrade) {
        finalStatus = "Aprobado"
        message = `Promedio: ${currentPoints.toFixed(2)}`
      } else if (currentPoints >= minExamGrade) {
        finalStatus = "A Examen"
        message = `Promedio: ${currentPoints.toFixed(2)}`
      } else {
        finalStatus = "Reprobado"
        message = `Promedio: ${currentPoints.toFixed(2)}`
      }
    } else if (totalPercentage > 100) {
      finalStatus = "Error"
      message = `El porcentaje total es ${totalPercentage}% (debe ser 100%)`
    } else {
      // Missing grades or total percentage < 100%
      message = "Faltan notas o el porcentaje es diferente a 100%"

      if (remainingPercentage > 0) {
        // Calculate min needed to pass
        const pointsNeededToPass = minPassingGrade - currentPoints
        minNeededToPass = (pointsNeededToPass * 100) / remainingPercentage
        minNeededToPass = Number.parseFloat(minNeededToPass.toFixed(2)) // Keep 2 decimal places for precision

        // Calculate min needed to go to exam
        const pointsNeededToExam = minExamGrade - currentPoints
        minNeededToExam = (pointsNeededToExam * 100) / remainingPercentage
        minNeededToExam = Number.parseFloat(minNeededToExam.toFixed(2)) // Keep 2 decimal places for precision
      }
    }

    return {
      totalPercentage,
      average: currentPoints,
      status: finalStatus,
      message,
      minNeededToPass,
      minNeededToExam,
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calculator className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Calculadora de Notas
            </h1>
          </div>
          <p className="text-gray-600">Calcula tus promedios y mantén control de tu rendimiento académico</p>
        </motion.div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <Dialog open={isAddGradeOpen} onOpenChange={setIsAddGradeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={subjects.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Evaluación
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Evaluación</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Ramo</Label>
                  <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un ramo" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.code} - {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gradeName">Nombre de la Evaluación</Label>
                  <Input
                    id="gradeName"
                    value={newGrade.name}
                    onChange={(e) => setNewGrade({ ...newGrade, name: e.target.value })}
                    placeholder="Ej: Prueba 1, Tarea, Proyecto Final"
                  />
                </div>
                <div>
                  <Label htmlFor="percentage">Porcentaje (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="1"
                    max="100"
                    value={newGrade.percentage}
                    onChange={(e) => setNewGrade({ ...newGrade, percentage: e.target.value })}
                    placeholder="Ej: 30"
                  />
                </div>
                <div>
                  <Label htmlFor="score">Nota (Opcional)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="1"
                    max="7"
                    step="0.1"
                    value={newGrade.score}
                    onChange={(e) => setNewGrade({ ...newGrade, score: e.target.value })}
                    placeholder="Ej: 6.5"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addGrade} className="flex-1">
                    Agregar
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddGradeOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Settings Button and Dialog */}
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white/70 backdrop-blur-sm">
                <Settings className="w-4 h-4 mr-2" />
                Configuración de Notas
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Configuración de Notas</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="minPassingGrade">Nota Mínima para Aprobar</Label>
                  <Input
                    id="minPassingGrade"
                    type="number"
                    min="1"
                    max="7"
                    step="0.01" // Allow two decimal places
                    value={tempMinPassingGrade}
                    onChange={(e) => setTempMinPassingGrade(e.target.value)}
                    placeholder="Ej: 3.96"
                  />
                </div>
                <div>
                  <Label htmlFor="minExamGrade">Nota Mínima para Ir a Examen</Label>
                  <Input
                    id="minExamGrade"
                    type="number"
                    min="1"
                    max="7"
                    step="0.01" // Allow two decimal places
                    value={tempMinExamGrade}
                    onChange={(e) => setTempMinExamGrade(e.target.value)}
                    placeholder="Ej: 3.56"
                  />
                </div>
                <Button
                  onClick={handleSaveSettings}
                  className={`w-full ${
                    settingsSaved ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {settingsSaved ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      ¡Configuración Guardada!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Configuración
                    </>
                  )}
                </Button>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <p>
                    • La nota para ir a examen ({minExamGrade.toFixed(2)}) debe ser menor que la nota para aprobar (
                    {minPassingGrade.toFixed(2)}).
                  </p>
                  <p>• Tus configuraciones se guardan automáticamente con tu cuenta.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* No subjects message */}
        {subjects.length === 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay ramos en tu horario</h3>
              <p className="text-gray-500">Primero agrega ramos a tu horario para poder calcular notas</p>
            </CardContent>
          </Card>
        )}

        {/* Subjects with grades */}
        <div className="space-y-6">
          {subjects.map((subject) => {
            const grades = getSubjectGrades(subject.id)
            const stats = calculateSubjectStats(subject.id)

            return (
              <motion.div key={subject.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-indigo-600">
                          {subject.code} - {subject.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline">Porcentaje Total: {stats.totalPercentage}%</Badge>
                          {stats.status === "Aprobado" && (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {stats.message} - ¡Aprobado!
                            </Badge>
                          )}
                          {stats.status === "A Examen" && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {stats.message} - ¡A Examen!
                            </Badge>
                          )}
                          {stats.status === "Reprobado" && (
                            <Badge className="bg-red-100 text-red-800 border-red-300">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {stats.message} - ¡Reprobado!
                            </Badge>
                          )}
                          {(stats.status === "Pendiente" || stats.status === "Error") && (
                            <div className="space-y-1">
                              <Badge variant="secondary">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {stats.message}
                              </Badge>
                              {stats.minNeededToPass !== null && stats.minNeededToPass <= 7 && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                  Necesitas {stats.minNeededToPass.toFixed(2)} para aprobar con{" "}
                                  {minPassingGrade.toFixed(2)}
                                </Badge>
                              )}
                              {stats.minNeededToPass !== null && stats.minNeededToPass > 7 && (
                                <Badge className="bg-red-100 text-red-800 border-red-300">
                                  Imposible aprobar con {minPassingGrade.toFixed(2)} (necesitarías{" "}
                                  {stats.minNeededToPass.toFixed(2)})
                                </Badge>
                              )}
                              {stats.minNeededToExam !== null && stats.minNeededToExam <= 7 && (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                                  Necesitas {stats.minNeededToExam.toFixed(2)} para ir a examen con{" "}
                                  {minExamGrade.toFixed(2)}
                                </Badge>
                              )}
                              {stats.minNeededToExam !== null && stats.minNeededToExam > 7 && (
                                <Badge className="bg-red-100 text-red-800 border-red-300">
                                  Imposible ir a examen con {minExamGrade.toFixed(2)} (necesitarías{" "}
                                  {stats.minNeededToExam.toFixed(2)})
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {grades.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calculator className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No hay evaluaciones registradas</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {grades.map((grade) => (
                          <div
                            key={grade.id}
                            className="flex items-center gap-4 p-3 bg-white/50 rounded-lg border group"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{grade.name}</div>
                              <div className="text-sm text-gray-600">{grade.percentage}%</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                max="7"
                                step="0.1"
                                value={grade.score || ""}
                                onChange={(e) => updateGradeScore(subject.id, grade.id, e.target.value)}
                                placeholder="Nota"
                                className="w-20 text-center"
                              />
                              <button
                                onClick={() => removeGrade(subject.id, grade.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
