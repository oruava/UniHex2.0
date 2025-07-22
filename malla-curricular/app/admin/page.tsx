"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { motion } from "framer-motion"
import { Shield, Users, Trash2, Mail, Calendar, Database, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Note: For full admin, you'd need service role key
)

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
  email_confirmed_at: string
}

interface UserData {
  id: string
  user_id: string
  levels: string
  schedule: string
  calendar_events: string
  subject_grades: string
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [userData, setUserData] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [adminPassword, setAdminPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showUserData, setShowUserData] = useState(false)

  // Simple admin authentication (in production, use proper auth)
  const ADMIN_PASSWORD = "unioru99" // Contraseña de administrador

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers()
      loadUserData()
    }
  }, [isAuthenticated])

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert("Contraseña incorrecta")
    }
  }

  const loadUsers = async () => {
    try {
      // Note: This requires RLS policies or service role key
      const { data, error } = await supabase.auth.admin.listUsers()

      if (error) {
        console.error("Error loading users:", error)
        // Fallback: try to get users from user_data table
        const { data: userDataList, error: userDataError } = await supabase
          .from("user_data")
          .select("user_id, created_at")

        if (!userDataError && userDataList) {
          // Create mock user objects
          const mockUsers = userDataList.map((ud) => ({
            id: ud.user_id,
            email: "user@example.com", // Can't get real email without service role
            created_at: ud.created_at,
            last_sign_in_at: null,
            email_confirmed_at: ud.created_at,
          }))
          setUsers(mockUsers)
        }
      } else {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase.from("user_data").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading user data:", error)
      } else {
        setUserData(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUserData = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar todos los datos de este usuario?")) {
      return
    }

    try {
      const { error } = await supabase.from("user_data").delete().eq("user_id", userId)

      if (error) {
        console.error("Error deleting user data:", error)
        alert("Error eliminando datos del usuario")
      } else {
        alert("Datos del usuario eliminados exitosamente")
        loadUserData()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const getUserDataStats = (userId: string) => {
    const data = userData.find((ud) => ud.user_id === userId)
    if (!data) return null

    try {
      const levels = JSON.parse(data.levels || "[]")
      const schedule = JSON.parse(data.schedule || "[]")
      const events = JSON.parse(data.calendar_events || "[]")
      const grades = JSON.parse(data.subject_grades || "[]")

      const totalSubjects = levels.reduce((acc: number, level: any) => acc + (level.subjects?.length || 0), 0)
      const completedSubjects = levels.reduce(
        (acc: number, level: any) => acc + (level.subjects?.filter((s: any) => s.completed)?.length || 0),
        0,
      )

      return {
        totalSubjects,
        completedSubjects,
        scheduleItems: schedule.length,
        calendarEvents: events.length,
        subjectGrades: grades.length,
        levels: levels.length,
      }
    } catch {
      return null
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              Panel de Administración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Contraseña de Administrador</label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full bg-red-600 hover:bg-red-700">
              Acceder
            </Button>
            <div className="text-xs text-gray-500 text-center">
              <p>⚠️ Solo para administradores</p>
              <p>Acceso restringido</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
          </div>
          <p className="text-gray-600">Gestión de usuarios y datos de UniHex</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{userData.length}</div>
              <div className="text-gray-600">Usuarios Registrados</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Database className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {userData.reduce((acc, ud) => {
                  const stats = getUserDataStats(ud.user_id)
                  return acc + (stats?.totalSubjects || 0)
                }, 0)}
              </div>
              <div className="text-gray-600">Total de Ramos</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {userData.reduce((acc, ud) => {
                  const stats = getUserDataStats(ud.user_id)
                  return acc + (stats?.calendarEvents || 0)
                }, 0)}
              </div>
              <div className="text-gray-600">Eventos Totales</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuarios Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando usuarios...</div>
            ) : userData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay usuarios registrados</div>
            ) : (
              <div className="space-y-4">
                {userData.map((user) => {
                  const stats = getUserDataStats(user.user_id)
                  return (
                    <div key={user.id} className="border rounded-lg p-4 bg-white/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm">{user.user_id}</span>
                            <Badge variant="outline">Usuario</Badge>
                          </div>

                          {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-semibold">Niveles:</span> {stats.levels}
                              </div>
                              <div>
                                <span className="font-semibold">Ramos:</span> {stats.completedSubjects}/
                                {stats.totalSubjects}
                              </div>
                              <div>
                                <span className="font-semibold">Horario:</span> {stats.scheduleItems} clases
                              </div>
                              <div>
                                <span className="font-semibold">Eventos:</span> {stats.calendarEvents}
                              </div>
                              <div>
                                <span className="font-semibold">Notas:</span> {stats.subjectGrades} ramos
                              </div>
                            </div>
                          )}

                          <div className="text-xs text-gray-500 mt-2">
                            Registrado: {new Date(user.created_at).toLocaleDateString("es-ES")}
                            {user.updated_at && (
                              <> • Última actividad: {new Date(user.updated_at).toLocaleDateString("es-ES")}</>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Datos del Usuario</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-gray-50 p-3 rounded">
                                  <h4 className="font-semibold mb-2">ID de Usuario:</h4>
                                  <code className="text-sm">{user.user_id}</code>
                                </div>

                                {stats && (
                                  <>
                                    <div className="bg-blue-50 p-3 rounded">
                                      <h4 className="font-semibold mb-2">Malla Curricular:</h4>
                                      <p>
                                        {stats.levels} niveles, {stats.totalSubjects} ramos ({stats.completedSubjects}{" "}
                                        completados)
                                      </p>
                                    </div>

                                    <div className="bg-green-50 p-3 rounded">
                                      <h4 className="font-semibold mb-2">Horario:</h4>
                                      <p>{stats.scheduleItems} clases programadas</p>
                                    </div>

                                    <div className="bg-purple-50 p-3 rounded">
                                      <h4 className="font-semibold mb-2">Calendario:</h4>
                                      <p>{stats.calendarEvents} eventos guardados</p>
                                    </div>

                                    <div className="bg-orange-50 p-3 rounded">
                                      <h4 className="font-semibold mb-2">Notas:</h4>
                                      <p>{stats.subjectGrades} ramos con evaluaciones</p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteUserData(user.user_id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logout */}
        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => setIsAuthenticated(false)} className="bg-transparent">
            Cerrar Sesión de Admin
          </Button>
        </div>
      </div>
    </div>
  )
}
