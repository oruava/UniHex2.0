"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, Calendar, Clock, BookOpen, Calculator, Home, Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@supabase/supabase-js"

// Import components
import AuthPage from "./components/auth-page"
import MallaCurricular from "./components/malla-curricular"
import Horario from "./components/horario"
import CalendarioAcademico from "./components/calendario-academico"
import CalcularNotas from "./components/calcular-notas"

type WindowType = "home" | "horario" | "calendario" | "malla" | "notas"

interface User {
  id: string
  email: string
}

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

interface CalendarEvent {
  id: string
  date: string
  title: string
  description?: string
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

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function UniversityApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentWindow, setCurrentWindow] = useState<WindowType>("home")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

  // User data state
  const [levels, setLevels] = useState<Level[]>([
    { level: 1, subjects: [] },
    { level: 2, subjects: [] },
    { level: 3, subjects: [] },
  ])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [subjectGrades, setSubjectGrades] = useState<SubjectGrades[]>([])
  const [minPassingGrade, setMinPassingGrade] = useState(3.96)
  const [minExamGrade, setMinExamGrade] = useState(3.56)

  // Use ref to track if we're currently saving to prevent loops
  const isSaving = useRef(false)
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    checkUser()
  }, [])

  // Save user data whenever it changes (but only after data is loaded)
  useEffect(() => {
    if (currentUser && dataLoaded && !isSaving.current) {
      // Debounce saves to avoid too many requests
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
      }

      saveTimeout.current = setTimeout(() => {
        saveUserData()
      }, 1000) // Wait 1 second after last change
    }
  }, [levels, schedule, calendarEvents, subjectGrades, minPassingGrade, minExamGrade, currentUser, dataLoaded])

  const checkUser = async () => {
    try {
      console.log("🔍 Checking user session...")
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        console.log("✅ User found:", session.user.email)
        setCurrentUser({ id: session.user.id, email: session.user.email! })
        await loadUserData(session.user.id)
      } else {
        console.log("❌ No user session found")
      }
    } catch (error) {
      console.error("❌ Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveUserData = async () => {
    if (!currentUser || isSaving.current) {
      console.log("⏭️ Skipping save - no user or already saving")
      return
    }

    isSaving.current = true
    console.log("💾 Saving user data...")

    try {
      const userData = {
        user_id: currentUser.id,
        levels: JSON.stringify(levels),
        schedule: JSON.stringify(schedule),
        calendar_events: JSON.stringify(calendarEvents),
        subject_grades: JSON.stringify(subjectGrades),
        min_passing_grade: minPassingGrade,
        min_exam_grade: minExamGrade,
        updated_at: new Date().toISOString(),
      }

      console.log("📤 Data to save:", {
        user_id: userData.user_id,
        levels_count: levels.reduce((acc, level) => acc + level.subjects.length, 0),
        schedule_count: schedule.length,
        events_count: calendarEvents.length,
        grades_count: subjectGrades.length,
      })

      // First, check if record exists
      const { data: existingData, error: checkError } = await supabase
        .from("user_data")
        .select("id")
        .eq("user_id", currentUser.id)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("❌ Error checking existing data:", checkError)
        throw checkError
      }

      let result
      if (existingData) {
        // Update existing record
        console.log("🔄 Updating existing record...")
        result = await supabase
          .from("user_data")
          .update({
            levels: userData.levels,
            schedule: userData.schedule,
            calendar_events: userData.calendar_events,
            subject_grades: userData.subject_grades,
            min_passing_grade: userData.min_passing_grade,
            min_exam_grade: userData.min_exam_grade,
            updated_at: userData.updated_at,
          })
          .eq("user_id", currentUser.id)
          .select()
      } else {
        // Insert new record
        console.log("➕ Creating new record...")
        result = await supabase.from("user_data").insert(userData).select()
      }

      if (result.error) {
        console.error("❌ Error saving user data:", result.error)
        alert("Error guardando datos: " + result.error.message)
      } else {
        console.log("✅ Data saved successfully!", result.data)
      }
    } catch (error) {
      console.error("❌ Unexpected error saving user data:", error)
      alert("Error inesperado guardando datos")
    } finally {
      isSaving.current = false
    }
  }

  const loadUserData = async (userId: string) => {
    try {
      console.log("📥 Loading user data for:", userId)

      const { data, error } = await supabase.from("user_data").select("*").eq("user_id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("❌ Error loading user data:", error)
        setDataLoaded(true)
        return
      }

      if (data) {
        console.log("✅ User data found:", {
          levels_length: data.levels?.length || 0,
          schedule_length: data.schedule?.length || 0,
          events_length: data.calendar_events?.length || 0,
          grades_length: data.subject_grades?.length || 0,
        })

        // Parse and set data
        try {
          const parsedLevels = JSON.parse(data.levels || "[]")
          const parsedSchedule = JSON.parse(data.schedule || "[]")
          const parsedCalendarEvents = JSON.parse(data.calendar_events || "[]")
          const parsedSubjectGrades = JSON.parse(data.subject_grades || "[]")

          console.log("📊 Parsed data:", {
            levels: parsedLevels,
            schedule: parsedSchedule,
            events: parsedCalendarEvents,
            grades: parsedSubjectGrades,
          })

          setLevels(
            parsedLevels.length > 0
              ? parsedLevels
              : [
                  { level: 1, subjects: [] },
                  { level: 2, subjects: [] },
                  { level: 3, subjects: [] },
                ],
          )
          setSchedule(parsedSchedule)
          setCalendarEvents(parsedCalendarEvents)
          setSubjectGrades(parsedSubjectGrades)
          setMinPassingGrade(data.min_passing_grade || 3.96)
          setMinExamGrade(data.min_exam_grade || 3.56)
        } catch (parseError) {
          console.error("❌ Error parsing data:", parseError)
        }
      } else {
        console.log("ℹ️ No existing data found, using defaults")
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error)
    } finally {
      setDataLoaded(true)
      console.log("✅ Data loading completed")
    }
  }

  const handleLogin = (user: User) => {
    console.log("🔐 User logged in:", user.email)
    setCurrentUser(user)
    setDataLoaded(false)
    loadUserData(user.id)
  }

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...")

      // Save data before logout
      if (currentUser && dataLoaded) {
        await saveUserData()
      }

      await supabase.auth.signOut()
      setCurrentUser(null)
      setCurrentWindow("home")
      setDataLoaded(false)

      // Reset data
      setLevels([
        { level: 1, subjects: [] },
        { level: 2, subjects: [] },
        { level: 3, subjects: [] },
      ])
      setSchedule([])
      setCalendarEvents([])
      setSubjectGrades([])
      setMinPassingGrade(3.96)
      setMinExamGrade(3.56)

      console.log("✅ Logout completed")
    } catch (error) {
      console.error("❌ Error logging out:", error)
    }
  }

  // Manual save function for testing
  const manualSave = async () => {
    console.log("🔧 Manual save triggered")
    await saveUserData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // If not logged in, show auth page
  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />
  }

  // Show loading while data is being loaded
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Cargando tus datos...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "horario", label: "Horario", icon: Clock },
    { id: "calendario", label: "Calendario", icon: Calendar },
    { id: "malla", label: "Malla Curricular", icon: BookOpen },
    { id: "notas", label: "Calcular Notas", icon: Calculator },
  ]

  const renderCurrentWindow = () => {
    switch (currentWindow) {
      case "horario":
        return <Horario levels={levels} schedule={schedule} setSchedule={setSchedule} />
      case "calendario":
        return <CalendarioAcademico events={calendarEvents} setEvents={setCalendarEvents} />
      case "malla":
        return <MallaCurricular levels={levels} setLevels={setLevels} />
      case "notas":
        return (
          <CalcularNotas
            schedule={schedule}
            subjectGrades={subjectGrades}
            setSubjectGrades={setSubjectGrades}
            minPassingGrade={minPassingGrade}
            setMinPassingGrade={setMinPassingGrade}
            minExamGrade={minExamGrade}
            setMinExamGrade={setMinExamGrade}
          />
        )
      default:
        return <HomePage setCurrentWindow={setCurrentWindow} currentUser={currentUser} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                UniHex
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={currentWindow === item.id ? "default" : "ghost"}
                    onClick={() => setCurrentWindow(item.id as WindowType)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:block">{currentUser.email}</span>

              {/* Debug button - remove this in production */}
              <Button variant="outline" size="sm" onClick={manualSave} className="text-xs bg-transparent">
                💾 Guardar
              </Button>

              <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Salir</span>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/90 backdrop-blur-sm border-t border-gray-200"
            >
              <div className="px-4 py-2 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.id}
                      variant={currentWindow === item.id ? "default" : "ghost"}
                      onClick={() => {
                        setCurrentWindow(item.id as WindowType)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full justify-start flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWindow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentWindow()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

// Home Page Component
function HomePage({
  setCurrentWindow,
  currentUser,
}: {
  setCurrentWindow: (window: WindowType) => void
  currentUser: User
}) {
  const features = [
    {
      id: "horario",
      title: "Gestiona tu Horario",
      description: "Organiza tus clases semanales y mantén control de tu tiempo académico",
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "calendario",
      title: "Calendario Académico",
      description: "Nunca olvides una prueba o entrega con nuestro calendario personalizado",
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "malla",
      title: "Malla Curricular",
      description: "Visualiza tu progreso académico y planifica tu carrera universitaria",
      icon: BookOpen,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "notas",
      title: "Calculadora de Notas",
      description: "Calcula tus promedios y mantén control de tu rendimiento académico",
      icon: Calculator,
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            ¡Bienvenido de vuelta!
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Tu espacio personal para organizar tu vida universitaria. Todos tus datos se sincronizan automáticamente en la
          nube.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => setCurrentWindow("malla")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Ir a Malla Curricular
          </Button>
          <Button size="lg" variant="outline" onClick={() => setCurrentWindow("horario")}>
            Ver Horario
          </Button>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/70 backdrop-blur-sm border-0"
                onClick={() => setCurrentWindow(feature.id as WindowType)}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* User Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-20 text-center"
      >
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Sincronización en la nube</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border-0 shadow-sm">
            <div className="text-3xl font-bold text-indigo-600 mb-2">☁️</div>
            <div className="text-gray-600">Datos en la Nube</div>
            <div className="text-sm text-gray-500 mt-1">Accede desde cualquier dispositivo</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border-0 shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-2">🔄</div>
            <div className="text-gray-600">Sincronización Automática</div>
            <div className="text-sm text-gray-500 mt-1">Cambios guardados en tiempo real</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border-0 shadow-sm">
            <div className="text-3xl font-bold text-pink-600 mb-2">🔐</div>
            <div className="text-gray-600">Seguro y Privado</div>
            <div className="text-sm text-gray-500 mt-1">Tu información está protegida</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
