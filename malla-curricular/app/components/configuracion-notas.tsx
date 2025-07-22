"use client"

import { motion } from "framer-motion"
import { Settings, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface ConfiguracionNotasProps {
  minPassingGrade: number
  setMinPassingGrade: (grade: number) => void
}

export default function ConfiguracionNotas({ minPassingGrade, setMinPassingGrade }: ConfiguracionNotasProps) {
  const [tempGrade, setTempGrade] = useState(minPassingGrade.toString())
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const grade = Number.parseFloat(tempGrade)
    if (grade >= 1 && grade <= 7) {
      setMinPassingGrade(grade)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      alert("La nota debe estar entre 1.0 y 7.0")
    }
  }

  const presetGrades = [
    { label: "4.0 (Tradicional)", value: 4.0 },
    { label: "3.5", value: 3.5 },
    { label: "3.0", value: 3.0 },
    { label: "2.5", value: 2.5 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Settings className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Configuración
            </h1>
          </div>
          <p className="text-gray-600">Personaliza la configuración de tu calculadora de notas</p>
        </motion.div>

        {/* Configuration Cards */}
        <div className="space-y-6">
          {/* Passing Grade Configuration */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-indigo-600">Nota Mínima para Aprobar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Setting */}
                  <div>
                    <Label htmlFor="minGrade">Nota Mínima Actual</Label>
                    <div className="mt-2 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="text-2xl font-bold text-indigo-600">{minPassingGrade.toFixed(1)}</div>
                      <div className="text-sm text-indigo-600">Nota mínima para aprobar</div>
                    </div>
                  </div>

                  {/* New Setting */}
                  <div>
                    <Label htmlFor="newGrade">Nueva Nota Mínima</Label>
                    <div className="space-y-3 mt-2">
                      <Input
                        id="newGrade"
                        type="number"
                        min="1"
                        max="7"
                        step="0.1"
                        value={tempGrade}
                        onChange={(e) => setTempGrade(e.target.value)}
                        placeholder="Ej: 4.0"
                        className="text-center text-lg font-semibold"
                      />
                      <Button
                        onClick={handleSave}
                        className={`w-full ${
                          saved ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                      >
                        {saved ? (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            ¡Guardado!
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Preset Options */}
                <div>
                  <Label>Configuraciones Predefinidas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {presetGrades.map((preset) => (
                      <Button
                        key={preset.value}
                        variant={minPassingGrade === preset.value ? "default" : "outline"}
                        onClick={() => {
                          setTempGrade(preset.value.toString())
                          setMinPassingGrade(preset.value)
                        }}
                        className="text-sm"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">¿Cómo funciona?</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Esta nota se usa para calcular qué necesitas para aprobar</li>
                    <li>• Cuando tus evaluaciones no sumen 100%, te diremos la nota mínima necesaria</li>
                    <li>• Puedes cambiarla según los requisitos de tu universidad</li>
                    <li>• La configuración se guarda automáticamente en tu cuenta</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Example Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-green-600">Ejemplo de Cálculo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">Escenario de Ejemplo:</h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>• Prueba 1 (30%): 5.5</span>
                      <span className="font-mono">30% × 5.5 = 1.65</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Tarea (20%): 6.0</span>
                      <span className="font-mono">20% × 6.0 = 1.20</span>
                    </div>
                    <div className="flex justify-between border-t border-green-300 pt-2">
                      <span>
                        • <strong>Total actual:</strong>
                      </span>
                      <span className="font-mono font-semibold">50% = 2.85 puntos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        • <strong>Falta por evaluar:</strong>
                      </span>
                      <span className="font-mono font-semibold">50%</span>
                    </div>
                    <div className="flex justify-between border-t border-green-300 pt-2">
                      <span>
                        • <strong>Para aprobar con {minPassingGrade.toFixed(1)}:</strong>
                      </span>
                      <span className="font-mono font-semibold">
                        Necesitas {((minPassingGrade - 2.85) / 0.5).toFixed(1)} en el 50% restante
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
