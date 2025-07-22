"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { GraduationCap, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token_hash = searchParams.get("token_hash")
        const type = searchParams.get("type")

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          })

          if (error) {
            console.error("Error confirming email:", error)
            setStatus("error")
            setMessage(error.message || "Error al confirmar el email")
          } else {
            setStatus("success")
            setMessage("¡Email confirmado exitosamente!")

            // Redirect to home after 3 seconds
            setTimeout(() => {
              router.push("/")
            }, 3000)
          }
        } else {
          setStatus("error")
          setMessage("Link de confirmación inválido")
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        setStatus("error")
        setMessage("Error inesperado al confirmar el email")
      }
    }

    handleEmailConfirmation()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-12 h-12 text-indigo-600" />
            <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              UniHex
            </span>
          </div>
        </div>

        {/* Confirmation Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Confirmación de Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {status === "loading" && (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 mx-auto text-indigo-600 animate-spin" />
                <p className="text-gray-600">Confirmando tu email...</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">¡Confirmación Exitosa!</h3>
                  <p className="text-gray-600 mb-4">{message}</p>
                  <p className="text-sm text-gray-500">Serás redirigido automáticamente en unos segundos...</p>
                </div>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Ir a UniHex
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <XCircle className="w-16 h-16 mx-auto text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Error de Confirmación</h3>
                  <p className="text-gray-600 mb-4">{message}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    El link puede haber expirado o ser inválido. Intenta registrarte nuevamente.
                  </p>
                </div>
                <Button onClick={() => router.push("/")} variant="outline" className="bg-transparent">
                  Volver al Inicio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
