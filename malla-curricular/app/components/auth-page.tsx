"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@supabase/supabase-js"

interface AuthPageProps {
  onLogin: (user: { id: string; email: string }) => void
}

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState("")

  const validateForm = () => {
    const newErrors: string[] = []

    if (!formData.email.trim()) {
      newErrors.push("El email es requerido")
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push("El email no es válido")
    }

    if (!formData.password) {
      newErrors.push("La contraseña es requerida")
    }

    if (!isLogin && formData.password.length < 6) {
      newErrors.push("La contraseña debe tener al menos 6 caracteres")
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.push("Las contraseñas no coinciden")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors([])
    setMessage("")

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          setErrors([error.message])
        } else if (data.user) {
          onLogin({ id: data.user.id, email: data.user.email! })
        }
      } else {
        // Register
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          setErrors([error.message])
        } else if (data.user) {
          if (data.user.email_confirmed_at) {
            // User is immediately confirmed
            onLogin({ id: data.user.id, email: data.user.email! })
          } else {
            // User needs to confirm email
            setMessage("¡Cuenta creada! Revisa tu email para confirmar tu cuenta.")
            setIsLogin(true)
          }
        }
      }
    } catch (error) {
      setErrors(["Ha ocurrido un error inesperado"])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
    })
    setErrors([])
    setMessage("")
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-12 h-12 text-indigo-600" />
            <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Uni-Hex
            </span>
          </div>
          <p className="text-gray-600">Tu asistente universitario personal</p>
        </div>

        {/* Auth Form */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    placeholder="tu@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    placeholder="Tu contraseña"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (only for register) */}
              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10"
                      placeholder="Confirma tu contraseña"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-600 text-sm">{message}</p>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-600 text-sm">
                      • {error}
                    </p>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isLogin ? "Iniciando sesión..." : "Creando cuenta..."}
                  </>
                ) : isLogin ? (
                  "Iniciar Sesión"
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>

            {/* Switch Mode */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
                <button
                  type="button"
                  onClick={switchMode}
                  className="ml-2 text-indigo-600 hover:text-indigo-700 font-medium"
                  disabled={loading}
                >
                  {isLogin ? "Regístrate aquí" : "Inicia sesión"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center">
          <Card className="bg-white/50 backdrop-blur-sm border-0">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>🌐 Acceso Universal:</strong> Crea tu cuenta y accede desde cualquier dispositivo
              </p>
              <p className="text-xs text-gray-500">Tus datos se sincronizan automáticamente en la nube</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
