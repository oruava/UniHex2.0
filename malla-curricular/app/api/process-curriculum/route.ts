import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const text = formData.get("text") as string
    const image = formData.get("image") as File

    let prompt = `
Eres un experto en análisis de mallas curriculares universitarias. Tu tarea es extraer información estructurada de mallas curriculares.

INSTRUCCIONES:
1. Analiza el contenido proporcionado (texto o imagen)
2. Extrae TODOS los ramos/asignaturas con su información
3. Organiza por niveles/semestres
4. Devuelve SOLO un JSON válido con la estructura exacta que te muestro

ESTRUCTURA REQUERIDA:
{
  "levels": [
    {
      "level": 1,
      "subjects": [
        {
          "id": "unique_id",
          "code": "CODIGO_RAMO",
          "name": "NOMBRE COMPLETO DEL RAMO",
          "hours": numero_horas,
          "sct": numero_creditos,
          "completed": false
        }
      ]
    }
  ]
}

REGLAS IMPORTANTES:
- Usa códigos de ramo en MAYÚSCULAS
- Nombres de ramos en MAYÚSCULAS
- Si no encuentras horas, usa 4 por defecto
- Si no encuentras créditos SCT, usa 5 por defecto
- Genera IDs únicos para cada ramo
- Organiza por niveles/semestres correctamente
- completed siempre debe ser false

`

    if (text) {
      prompt += `\nTEXTO A ANALIZAR:\n${text}`
    }

    let result

    if (image) {
      // Convert image to base64
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString("base64")

      result = await generateText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image",
                image: `data:${image.type};base64,${base64}`,
              },
            ],
          },
        ],
        maxTokens: 4000,
      })
    } else {
      result = await generateText({
        model: openai("gpt-4o"),
        prompt: prompt,
        maxTokens: 4000,
      })
    }

    // Parse the AI response
    let parsedData
    try {
      // Extract JSON from the response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return NextResponse.json({
        success: false,
        error: "No se pudo procesar la información. Intenta con una imagen más clara o texto más detallado.",
      })
    }

    // Validate and process the data
    if (!parsedData.levels || !Array.isArray(parsedData.levels)) {
      return NextResponse.json({
        success: false,
        error: "Formato de datos inválido",
      })
    }

    // Add unique IDs and ensure proper formatting
    const processedLevels: Level[] = parsedData.levels.map((level: any, levelIndex: number) => ({
      level: level.level || levelIndex + 1,
      subjects: (level.subjects || []).map((subject: any, subjectIndex: number) => ({
        id: `${Date.now()}-${levelIndex}-${subjectIndex}`,
        code: (subject.code || `RAMO${subjectIndex + 1}`).toUpperCase(),
        name: (subject.name || "RAMO SIN NOMBRE").toUpperCase(),
        hours: Number(subject.hours) || 4,
        sct: Number(subject.sct) || 5,
        completed: false,
      })),
    }))

    const totalSubjects = processedLevels.reduce((acc, level) => acc + level.subjects.length, 0)

    return NextResponse.json({
      success: true,
      levels: processedLevels,
      totalSubjects,
      message: `Se procesaron ${totalSubjects} ramos en ${processedLevels.length} niveles`,
    })
  } catch (error) {
    console.error("Error in AI processing:", error)
    return NextResponse.json({
      success: false,
      error: "Error interno del servidor",
    })
  }
}
