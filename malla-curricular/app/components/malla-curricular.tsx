"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  BookOpen,
  Award,
  Plus,
  Minus,
  X,
  GraduationCap,
  RefreshCw,
  Upload,
  Download,
  FileText,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { careers } from "../data/careers"

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

interface MallaCurricularProps {
  levels: Level[]
  setLevels: (levels: Level[]) => void
}

export default function MallaCurricular({ levels, setLevels }: MallaCurricularProps) {
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false)
  const [isCareerSelectOpen, setIsCareerSelectOpen] = useState(false)
  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    hours: "",
    sct: "",
    level: "",
  })

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const toggleSubject = (levelIndex: number, subjectIndex: number) => {
    setLevels(
      levels.map((level, lIndex) =>
        lIndex === levelIndex
          ? {
              ...level,
              subjects: level.subjects.map((subject, sIndex) =>
                sIndex === subjectIndex ? { ...subject, completed: !subject.completed } : subject,
              ),
            }
          : level,
      ),
    )
  }

  const addLevel = () => {
    const newLevelNumber = levels.length + 1
    setLevels([...levels, { level: newLevelNumber, subjects: [] }])
  }

  const removeLevel = () => {
    if (levels.length > 1) {
      setLevels(levels.slice(0, -1))
    }
  }

  const addSubject = () => {
    if (!newSubject.code || !newSubject.name || !newSubject.hours || !newSubject.sct || !newSubject.level) {
      alert("Por favor completa todos los campos")
      return
    }

    const levelIndex = Number.parseInt(newSubject.level) - 1
    if (levelIndex < 0 || levelIndex >= levels.length) {
      alert("Nivel inválido")
      return
    }

    const subject: Subject = {
      id: Date.now().toString(),
      code: newSubject.code.toUpperCase(),
      name: newSubject.name.toUpperCase(),
      hours: Number.parseInt(newSubject.hours),
      sct: Number.parseFloat(newSubject.sct),
      completed: false,
    }

    setLevels(
      levels.map((level, index) =>
        index === levelIndex ? { ...level, subjects: [...level.subjects, subject] } : level,
      ),
    )

    setNewSubject({
      code: "",
      name: "",
      hours: "",
      sct: "",
      level: "",
    })
    setIsAddSubjectOpen(false)
  }

  const removeSubject = (levelIndex: number, subjectIndex: number) => {
    setLevels(
      levels.map((level, lIndex) =>
        lIndex === levelIndex
          ? {
              ...level,
              subjects: level.subjects.filter((_, sIndex) => sIndex !== subjectIndex),
            }
          : level,
      ),
    )
  }

  const resetAll = () => {
    if (
      confirm("¿Estás seguro de que quieres reiniciar la malla curricular? Esto eliminará TODOS los ramos y niveles.")
    ) {
      // Crear un nivel vacío inicial
      setLevels([{ level: 1, subjects: [] }])
    }
  }

  const loadCareer = (careerId: string) => {
    const career = careers.find((c) => c.id === careerId)
    if (!career) return

    if (
      confirm(
        `¿Estás seguro de que quieres cargar la malla de ${career.name} - ${career.university}? Esto reemplazará tu malla actual.`,
      )
    ) {
      // Convert career data to our format
      const newLevels: Level[] = career.levels.map((level) => ({
        level: level.level,
        subjects: level.subjects.map((subject) => ({
          id: subject.id,
          code: subject.code,
          name: subject.name,
          hours: subject.hours,
          sct: subject.sct,
          completed: false,
        })),
      }))

      setLevels(newLevels)
      setIsCareerSelectOpen(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
    }
  }

  const processImportFile = async () => {
    if (!importFile) return

    setIsProcessing(true)

    try {
      const text = await importFile.text()
      let data: any[] = []

      if (importFile.name.endsWith(".csv")) {
        // Parse CSV
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim())
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ""
          })
          if (row.codigo && row.nombre) {
            data.push(row)
          }
        }
      } else if (importFile.name.endsWith(".json")) {
        // Parse JSON
        data = JSON.parse(text)
      }

      if (data.length === 0) {
        alert("No se encontraron datos válidos en el archivo")
        return
      }

      // Convert to our format
      const levelMap = new Map<number, Subject[]>()

      data.forEach((item) => {
        const level = Number.parseInt(item.nivel || item.level || "1")
        const subject: Subject = {
          id: Date.now().toString() + Math.random(),
          code: (item.codigo || item.code || "").toUpperCase(),
          name: (item.nombre || item.name || item.asignatura || "").toUpperCase(),
          hours: Number.parseInt(item.horas || item.hours || "0"),
          sct: Number.parseFloat(item.sct || item.creditos || item.credits || "0"),
          completed: false,
        }

        if (!levelMap.has(level)) {
          levelMap.set(level, [])
        }
        levelMap.get(level)!.push(subject)
      })

      // Create new levels array
      const newLevels: Level[] = []
      const maxLevel = Math.max(...Array.from(levelMap.keys()))

      for (let i = 1; i <= maxLevel; i++) {
        newLevels.push({
          level: i,
          subjects: levelMap.get(i) || [],
        })
      }

      if (confirm(`¿Importar ${data.length} ramos en ${newLevels.length} niveles? Esto reemplazará tu malla actual.`)) {
        setLevels(newLevels)
        setIsImportOpen(false)
        setImportFile(null)
      }
    } catch (error) {
      console.error("Error processing file:", error)
      alert("Error procesando el archivo. Verifica el formato.")
    } finally {
      setIsProcessing(false)
    }
  }

  const exportToCSV = () => {
    const csvContent = ["Nivel,Codigo,Nombre,Horas,SCT,Completado"]

    levels.forEach((level) => {
      level.subjects.forEach((subject) => {
        csvContent.push(
          `${level.level},${subject.code},"${subject.name}",${subject.hours},${subject.sct},${subject.completed ? "Si" : "No"}`,
        )
      })
    })

    const blob = new Blob([csvContent.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "malla-curricular.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTotalStats = () => {
    const totalSubjects = levels.reduce((acc, level) => acc + level.subjects.length, 0)
    const completedSubjects = levels.reduce(
      (acc, level) => acc + level.subjects.filter((subject) => subject.completed).length,
      0,
    )
    const totalSCT = levels.reduce(
      (acc, level) => acc + level.subjects.reduce((levelAcc, subject) => levelAcc + subject.sct, 0),
      0,
    )
    const completedSCT = levels.reduce(
      (acc, level) =>
        acc +
        level.subjects.filter((subject) => subject.completed).reduce((levelAcc, subject) => levelAcc + subject.sct, 0),
      0,
    )

    return { totalSubjects, completedSubjects, totalSCT, completedSCT }
  }

  const stats = getTotalStats()
  const progressPercentage = stats.totalSubjects > 0 ? (stats.completedSubjects / stats.totalSubjects) * 100 : 0

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 overflow-hidden">
      <div className="h-full flex flex-col max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Mi Malla Curricular
          </h1>
          <p className="text-gray-600">Gestiona y visualiza tu progreso académico</p>
        </motion.div>

        {/* Stats and Controls */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center gap-2 mb-4 flex-wrap"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold">
              {stats.completedSubjects}/{stats.totalSubjects} Ramos
            </span>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold">
              {stats.completedSCT.toFixed(1)}/{stats.totalSCT.toFixed(1)} SCT
            </span>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <span className="text-sm font-semibold">{progressPercentage.toFixed(1)}% Completado</span>
          </div>

          {/* Control Buttons */}
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Upload className="w-4 h-4 mr-1" />
                Importar Malla
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Importar Malla Curricular</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">Formatos Soportados:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • <strong>CSV:</strong> Columnas: nivel, codigo, nombre, horas, sct
                    </li>
                    <li>
                      • <strong>JSON:</strong> Array de objetos con las mismas propiedades
                    </li>
                  </ul>
                </div>

                <div>
                  <Label htmlFor="file-upload">Seleccionar Archivo</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>

                {importFile && (
                  <div className="bg-gray-50 border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{importFile.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{(importFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={processImportFile} disabled={!importFile || isProcessing} className="flex-1">
                    {isProcessing ? "Procesando..." : "Importar"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsImportOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>

                <div className="border-t pt-3">
                  <Button variant="outline" onClick={exportToCSV} className="w-full bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Plantilla CSV
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCareerSelectOpen} onOpenChange={setIsCareerSelectOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <GraduationCap className="w-4 h-4 mr-1" />
                Cargar Carrera
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Seleccionar Carrera Predefinida</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Selecciona una carrera para cargar automáticamente todos los ramos con sus códigos, horas y créditos.
                </p>
                <div className="space-y-3">
                  {careers.map((career) => (
                    <Card
                      key={career.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => loadCareer(career.id)}
                    >
                      <CardContent className="p-4">
                        <div className="font-semibold text-indigo-600">{career.name}</div>
                        <div className="text-sm text-gray-600">{career.university}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {career.levels.length} niveles •{" "}
                          {career.levels.reduce((acc, level) => acc + level.subjects.length, 0)} ramos
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button variant="outline" onClick={() => setIsCareerSelectOpen(false)} className="w-full">
                  Cancelar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-1" />
                Agregar Ramo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Ramo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Código del Ramo</Label>
                  <Input
                    id="code"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    placeholder="Ej: ICC101"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nombre del Ramo</Label>
                  <Input
                    id="name"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    placeholder="Ej: Introducción a la Programación"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hours">Horas</Label>
                    <Input
                      id="hours"
                      type="number"
                      value={newSubject.hours}
                      onChange={(e) => setNewSubject({ ...newSubject, hours: e.target.value })}
                      placeholder="Ej: 4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sct">Créditos SCT</Label>
                    <Input
                      id="sct"
                      type="number"
                      step="0.1"
                      value={newSubject.sct}
                      onChange={(e) => setNewSubject({ ...newSubject, sct: e.target.value })}
                      placeholder="Ej: 5.0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="level">Nivel</Label>
                  <Select
                    value={newSubject.level}
                    onValueChange={(value) => setNewSubject({ ...newSubject, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.level} value={level.level.toString()}>
                          Nivel {level.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addSubject} className="flex-1">
                    Agregar Ramo
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddSubjectOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={addLevel} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Nivel
          </Button>
          <Button onClick={removeLevel} size="sm" variant="outline" disabled={levels.length <= 1}>
            <Minus className="w-4 h-4 mr-1" />
            Nivel
          </Button>
          <Button
            onClick={resetAll}
            size="sm"
            variant="outline"
            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Reiniciar
          </Button>
        </motion.div>

        {/* Progress Bar */}
        {stats.totalSubjects > 0 && (
          <div className="mb-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-full h-3 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
              />
            </div>
          </div>
        )}

        {/* Levels Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-auto">
            <div
              className="grid gap-2 h-full min-w-max"
              style={{
                gridTemplateColumns: `repeat(${levels.length}, minmax(280px, 1fr))`,
                width: `${levels.length * 300}px`,
              }}
            >
              {levels.map((level, levelIndex) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: levelIndex * 0.05 }}
                  className="bg-white/70 backdrop-blur-sm rounded-lg p-2 shadow-sm flex flex-col h-full w-[280px]"
                >
                  {/* Header de la columna */}
                  <div className="text-center mb-2 flex-shrink-0">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mx-auto mb-1">
                      {level.level}
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">Nivel {level.level}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {level.subjects.filter((s) => s.completed).length}/{level.subjects.length}
                    </Badge>
                  </div>

                  {/* Ramos en columna vertical */}
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {level.subjects.length === 0 ? (
                      <div className="text-center text-gray-400 text-xs mt-8">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No hay ramos</p>
                        <p>en este nivel</p>
                      </div>
                    ) : (
                      level.subjects.map((subject, subjectIndex) => (
                        <motion.div
                          key={subject.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="cursor-pointer relative group"
                          onClick={() => toggleSubject(levelIndex, subjectIndex)}
                        >
                          <Card
                            className={`transition-all duration-300 border ${
                              subject.completed
                                ? "bg-green-100 border-green-300 shadow-sm"
                                : "bg-white hover:bg-gray-50 border-gray-200 hover:border-indigo-300 shadow-sm"
                            } h-24`}
                          >
                            <CardContent className="p-2 h-full flex flex-col justify-between relative">
                              <div className="flex-1">
                                <div className="text-xs font-mono text-gray-600 mb-1">{subject.code}</div>
                                <div
                                  className={`text-xs font-medium leading-tight ${
                                    subject.completed ? "text-green-800" : "text-gray-800"
                                  }`}
                                  title={subject.name}
                                >
                                  {subject.name.length > 35 ? subject.name.substring(0, 35) + "..." : subject.name}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 flex justify-between mt-1">
                                <span>{subject.hours}h</span>
                                <span>{subject.sct}</span>
                              </div>

                              {/* Botón eliminar */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeSubject(levelIndex, subjectIndex)
                                }}
                                className="absolute top-0 left-0 -mt-1 -ml-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>

                              {/* Checkmark verde */}
                              <AnimatePresence>
                                {subject.completed && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 180 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="absolute top-0 right-0 -mt-1 -mr-1"
                                  >
                                    <CheckCircle className="w-5 h-5 text-green-600 bg-white rounded-full" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
