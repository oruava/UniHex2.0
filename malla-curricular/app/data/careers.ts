export interface CareerSubject {
  id: string
  code: string
  name: string
  hours: number
  sct: number
  completed: boolean
}

export interface CareerLevel {
  level: number
  subjects: CareerSubject[]
}

export interface Career {
  id: string
  name: string
  university: string
  levels: CareerLevel[]
}

export const careers: Career[] = [
  {
    id: "ing-civil-informatica-ufro",
    name: "Ingeniería Civil Informática",
    university: "Universidad de La Frontera",
    levels: [
      {
        level: 1,
        subjects: [
          { id: "ime027", code: "IME027", name: "PRECÁLCULO I", hours: 6, sct: 3.0, completed: false },
          { id: "ime028", code: "IME028", name: "INTRODUCCIÓN AL ÁLGEBRA", hours: 6, sct: 3.0, completed: false },
          { id: "ime029", code: "IME029", name: "PRECÁLCULO II", hours: 6, sct: 3.0, completed: false },
          { id: "ime030", code: "IME030", name: "ÁLGEBRA", hours: 6, sct: 3.0, completed: false },
          { id: "icq050", code: "ICQ050", name: "INTRODUCCIÓN A LA QUÍMICA", hours: 4, sct: 5.0, completed: false },
          {
            id: "dfi052",
            code: "DFI052",
            name: "HABILIDADES COMUNICATIVAS EN INGENIERÍA",
            hours: 3,
            sct: 3.0,
            completed: false,
          },
          { id: "ing050", code: "ING050", name: "INGENIERÍA Y SOCIEDAD", hours: 3, sct: 4.0, completed: false },
        ],
      },
      {
        level: 2,
        subjects: [
          { id: "ime045", code: "IME045", name: "CÁLCULO DIFERENCIAL", hours: 6, sct: 3.0, completed: false },
          {
            id: "ime046",
            code: "IME046",
            name: "MATEMÁTICA PARA LA COMPUTACIÓN I",
            hours: 3,
            sct: 2.0,
            completed: false,
          },
          { id: "ime048", code: "IME048", name: "CÁLCULO INTEGRAL", hours: 6, sct: 3.0, completed: false },
          {
            id: "ime047",
            code: "IME047",
            name: "MATEMÁTICA PARA LA COMPUTACIÓN II",
            hours: 3,
            sct: 2.0,
            completed: false,
          },
          { id: "icf115", code: "ICF115", name: "FÍSICA I", hours: 5, sct: 6.0, completed: false },
          { id: "ing104", code: "ING104", name: "LABORATORIO DE CIENCIAS", hours: 5, sct: 5.0, completed: false },
          {
            id: "ing101",
            code: "ING101",
            name: "INTRODUCCIÓN AL DISEÑO DE INGENIERÍA",
            hours: 4,
            sct: 5.0,
            completed: false,
          },
        ],
      },
      {
        level: 3,
        subjects: [
          { id: "ime298", code: "IME298", name: "CÁLCULO MULTIVARIABLE", hours: 5, sct: 5.0, completed: false },
          { id: "ime299", code: "IME299", name: "ÁLGEBRA LINEAL", hours: 4, sct: 5.0, completed: false },
          { id: "icf177", code: "ICF177", name: "FÍSICA II", hours: 5, sct: 6.0, completed: false },
          { id: "ing400", code: "ING400", name: "ELECTIVO DE INGENIERIA", hours: 3, sct: 3.0, completed: false },
          { id: "icc157", code: "ICC157", name: "TALLER DE PROGRAMACIÓN", hours: 3, sct: 3.0, completed: false },
          { id: "ing180", code: "ING180", name: "ECODISEÑO", hours: 3, sct: 4.0, completed: false },
        ],
      },
      {
        level: 4,
        subjects: [
          {
            id: "icc490",
            code: "ICC490",
            name: "PROGRAMACION ORIENTADA A OBJETOS",
            hours: 4,
            sct: 5.0,
            completed: false,
          },
          { id: "ime317", code: "IME317", name: "ECUACIONES DIFERENCIALES", hours: 4, sct: 6.0, completed: false },
          { id: "icf489", code: "ICF489", name: "FISICA III", hours: 4, sct: 5.0, completed: false },
          { id: "icc492", code: "ICC492", name: "TALLER DE COMPUTACION", hours: 4, sct: 4.0, completed: false },
          {
            id: "i95310",
            code: "I95310",
            name: "ELECTIVO DE FORMACION GENERAL I",
            hours: 3,
            sct: 3.0,
            completed: false,
          },
          {
            id: "ing200",
            code: "ING200",
            name: "TALLER DE DISEÑO DE INGENIERÍA",
            hours: 4,
            sct: 6.0,
            completed: false,
          },
        ],
      },
      {
        level: 5,
        subjects: [
          {
            id: "ime396",
            code: "IME396",
            name: "PROBABILIDAD Y ESTADÍSTICA PARA INGENIER",
            hours: 4,
            sct: 5.0,
            completed: false,
          },
          { id: "icc505", code: "ICC505", name: "BASES DE DATOS", hours: 3, sct: 4.0, completed: false },
          {
            id: "icc506",
            code: "ICC506",
            name: "INTERNET Y SISTEMAS OPERATIVOS",
            hours: 4,
            sct: 6.0,
            completed: false,
          },
          { id: "icc507", code: "ICC507", name: "ALGORITMOS Y PARADIGMAS", hours: 5, sct: 6.0, completed: false },
          {
            id: "i95350",
            code: "I95350",
            name: "ELECTIVO DE FORMACION GENERAL II",
            hours: 3,
            sct: 3.0,
            completed: false,
          },
          {
            id: "iis255",
            code: "IIS255",
            name: "ECONOMÍA Y FINANZAS EMPRESARIALES",
            hours: 4,
            sct: 5.0,
            completed: false,
          },
        ],
      },
      {
        level: 6,
        subjects: [
          { id: "icc528", code: "ICC528", name: "CIENCIAS DE LA COMPUTACION", hours: 4, sct: 5.0, completed: false },
          { id: "icc529", code: "ICC529", name: "TALLER DE BASES DE DATOS", hours: 4, sct: 6.0, completed: false },
          { id: "icc530", code: "ICC530", name: "COMPUTACION EN LA NUBE", hours: 4, sct: 6.0, completed: false },
          { id: "icc531", code: "ICC531", name: "INGENIERIA DE SOFTWARE", hours: 4, sct: 6.0, completed: false },
          { id: "iis595", code: "IIS595", name: "DISEÑO INTEGRAL DE PRODUCTOS", hours: 3, sct: 4.0, completed: false },
        ],
      },
      {
        level: 7,
        subjects: [
          { id: "icc608", code: "ICC608", name: "SISTEMAS INTELIGENTES", hours: 5, sct: 6.0, completed: false },
          { id: "icc609", code: "ICC609", name: "INGENIERIA DE DATOS", hours: 3, sct: 4.0, completed: false },
          { id: "icc610", code: "ICC610", name: "CIBERSEGURIDAD", hours: 4, sct: 6.0, completed: false },
          {
            id: "icc612",
            code: "ICC612",
            name: "DISEÑO DE EXPERIENCIA DE USUARIO",
            hours: 4,
            sct: 6.0,
            completed: false,
          },
          {
            id: "i95400",
            code: "I95400",
            name: "ELECTIVO DE FORMACION GENERAL III",
            hours: 3,
            sct: 3.0,
            completed: false,
          },
          {
            id: "iis598",
            code: "IIS598",
            name: "DISEÑO DE NEGOCIOS INNOVADORES",
            hours: 3,
            sct: 4.0,
            completed: false,
          },
        ],
      },
      {
        level: 8,
        subjects: [
          { id: "icc742", code: "ICC742", name: "TALLER DE INGENIERIA DE DATOS", hours: 4, sct: 7.0, completed: false },
          { id: "icc744", code: "ICC744", name: "TALLER DE I OT Y ROBOTICA", hours: 4, sct: 5.0, completed: false },
          {
            id: "icc745",
            code: "ICC745",
            name: "TALLER DE INGENIERIA DE SOFTWARE",
            hours: 5,
            sct: 6.0,
            completed: false,
          },
          {
            id: "icc746",
            code: "ICC746",
            name: "TALLER DE HABILIDADES PROFESIONALES",
            hours: 3,
            sct: 4.0,
            completed: false,
          },
          {
            id: "ing300",
            code: "ING300",
            name: "TALLER DE EMPRESAS TECNOLOGICAS",
            hours: 4,
            sct: 5.0,
            completed: false,
          },
        ],
      },
      {
        level: 9,
        subjects: [
          { id: "icc780", code: "ICC780", name: "ELECTIVO DE ESPECIALIDAD I", hours: 3, sct: 4.0, completed: false },
          { id: "icc782", code: "ICC782", name: "ELECTIVO DE ESPECIALIDAD II", hours: 3, sct: 4.0, completed: false },
          { id: "icc750", code: "ICC750", name: "DIRECCION DE PROYECTOS", hours: 4, sct: 6.0, completed: false },
          {
            id: "icc752",
            code: "ICC752",
            name: "PROYECTO DE DESARROLLO DE SOFTWARE",
            hours: 6,
            sct: 7.0,
            completed: false,
          },
          {
            id: "i95550",
            code: "I95550",
            name: "ELECTIVO DE FORMACION GENERAL IV",
            hours: 3,
            sct: 3.0,
            completed: false,
          },
          {
            id: "icc755",
            code: "ICC755",
            name: "DISEÑO PROYECTO DE INGENIERIA INFORMATIC",
            hours: 4,
            sct: 5.0,
            completed: false,
          },
        ],
      },
      {
        level: 10,
        subjects: [
          { id: "icc784", code: "ICC784", name: "ELECTIVO DE ESPECIALIDAD III", hours: 3, sct: 4.0, completed: false },
          {
            id: "icc760",
            code: "ICC760",
            name: "INVESTIGACION APLICADA EN INFORMATICA",
            hours: 5,
            sct: 7.0,
            completed: false,
          },
          {
            id: "icc762",
            code: "ICC762",
            name: "PROYECTO DE INTEGRACION DE INFORMATICA",
            hours: 5,
            sct: 6.0,
            completed: false,
          },
          { id: "icc786", code: "ICC786", name: "ELECTIVO DE ESPECIALIDAD IV", hours: 3, sct: 4.0, completed: false },
          { id: "ing500", code: "ING500", name: "CAPSTONE MULTIDISCIPLINARIO", hours: 4, sct: 5.0, completed: false },
        ],
      },
      {
        level: 11,
        subjects: [
          { id: "icc800", code: "ICC800", name: "ACTIVIDAD DE TITULACION", hours: 22, sct: 9.0, completed: false },
        ],
      },
    ],
  },
]
