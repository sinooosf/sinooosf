import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { JSONFilePreset } from 'lowdb/node'

dotenv.config()

// =====================================================
// PATHS
// =====================================================

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootDir = path.resolve(__dirname, '..')
const storageDir = path.join(rootDir, 'storage')
const uploadsDir = path.join(storageDir, 'uploads')
const dbPath = path.join(storageDir, 'db.json')
const adminDir = path.join(rootDir, 'admin')

// =====================================================
// CONFIG
// =====================================================

const PORT = Number(process.env.PORT || 4000)

// No Render environment variables required.
const ADMIN_PASSWORD = 'G6dnC'
const JWT_SECRET = 'sinoo-sf-admin-secret-2026'

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  'https://sinoosf.onrender.com',
  'https://sinoosf-api.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
]

app.use(
  cors({
    origin: (origin, callback) => {

      // Allow requests without an Origin header
      // such as direct API requests/server tools.
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      console.log('CORS BLOCKED:', origin)

      // Don't throw an error here.
      // Simply reject the origin.
      return callback(null, false)
    },

    credentials: true
  })
)

// =====================================================
// STORAGE
// =====================================================

fs.mkdirSync(storageDir, { recursive: true })
fs.mkdirSync(uploadsDir, { recursive: true })

// =====================================================
// DEFAULT DATABASE
// =====================================================

const defaultData = {
  status: [
    {
      id: 'status-1',
      label: 'Available for Freelance',
      value: 'Available for Freelance',
      active: true
    }
  ],

  skills: [
    'Web Development',
    'UI/UX Development',
    'Canva',
    'Prompt Engineering',
    'ReactJs / Tailwind',
    'JavaScript',
    'Git',
    'SEO Basics'
  ].map((name, i) => ({
    id: `skill-${i + 1}`,
    name
  })),

  projects: [
    {
      id: '01',
      name: 'Veloce Bikes',
      tag: 'E-Commerce Website',
      image: '/uploads/firstpro.jpg',
      url: '',
      number: '01'
    },
    {
      id: '02',
      name: 'Woodcraft',
      tag: 'Furniture Website',
      image: '/uploads/seconde.jpg',
      url: '',
      number: '02'
    },
    {
      id: '03',
      name: 'Urbanic',
      tag: 'Fashion Magazine',
      image: '/uploads/third.jpg',
      url: '',
      number: '03'
    },
    {
      id: '04',
      name: 'NEON',
      tag: 'Fashion Magazine',
      image: '/uploads/forthproject.jpg',
      url: '',
      number: '04'
    },
    {
      id: '05',
      name: 'BOOKS',
      tag: 'Fashion Magazine',
      image: '/uploads/thirdproject.jpg',
      url: '',
      number: '05'
    },
    {
      id: '06',
      name: 'PORTFOLIO',
      tag: 'Fashion Magazine',
      image: '/uploads/secondeproject.jpg',
      url: '',
      number: '06'
    }
  ],

  messages: []
}

// =====================================================
// DATABASE
// =====================================================

const db = await JSONFilePreset(
  dbPath,
  defaultData
)

// =====================================================
// EXPRESS
// =====================================================

const app = express()

app.set('trust proxy', 1)

// =====================================================
// CORS
// =====================================================

const allowedOrigins =
  FRONTEND_ORIGIN === '*'
    ? null
    : FRONTEND_ORIGIN
        .split(',')
        .map(s => s.trim())

app.use(
  cors({
    origin: (origin, callback) => {

      if (
        !origin ||
        !allowedOrigins ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true)
      }

      return callback(
        new Error('CORS origin not allowed')
      )
    },

    credentials: true
  })
)

// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: '2mb'
  })
)

// =====================================================
// STATIC FILES
// =====================================================

app.use(
  '/uploads',
  express.static(uploadsDir)
)

app.use(
  '/admin',
  express.static(adminDir)
)

// =====================================================
// MULTER
// =====================================================

const storage = multer.diskStorage({

  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },

  filename: (_req, file, cb) => {

    const ext = path
      .extname(file.originalname)
      .toLowerCase()

    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9-_]/gi, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)

    cb(
      null,
      `${Date.now()}-${base || 'project'}${ext}`
    )
  }
})

const upload = multer({

  storage,

  limits: {
    fileSize: 8 * 1024 * 1024
  },

  fileFilter: (_req, file, cb) => {

    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ]

    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// =====================================================
// AUTH MIDDLEWARE
// =====================================================

function auth(req, res, next) {

  const header =
    req.headers.authorization || ''

  const token =
    header.replace(/^Bearer\s+/i, '').trim()

  if (!token) {

    return res.status(401).json({
      error: 'Authentication required'
    })
  }

  try {

    const decoded =
      jwt.verify(token, JWT_SECRET)

    if (decoded?.role !== 'admin') {

      return res.status(401).json({
        error: 'Invalid administrator token'
      })
    }

    req.admin = decoded

    next()

  } catch (error) {

    console.error(
      'AUTH ERROR:',
      error.message
    )

    return res.status(401).json({
      error: 'Session expired'
    })
  }
}

// =====================================================
// HELPERS
// =====================================================

function id() {

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function cleanText(value, max = 500) {

  return String(value ?? '')
    .trim()
    .slice(0, max)
}

// =====================================================
// HEALTH
// =====================================================

app.get(
  '/api/health',
  (_req, res) => {

    res.status(200).json({
      ok: true,
      service: 'sinoo-sf-api'
    })
  }
)

// =====================================================
// ADMIN LOGIN
// =====================================================

app.post(
  '/api/auth/login',
  (req, res) => {

    console.log(
      'LOGIN REQUEST RECEIVED'
    )

    try {

      const password =
        String(req.body?.password || '')

      console.log(
        'Password received:',
        password ? 'YES' : 'NO'
      )

      if (password !== ADMIN_PASSWORD) {

        console.log(
          'LOGIN FAILED: INVALID PASSWORD'
        )

        return res.status(401).json({
          error: 'Invalid password'
        })
      }

      const token =
        jwt.sign(
          {
            role: 'admin'
          },
          JWT_SECRET,
          {
            expiresIn: '7d'
          }
        )

      console.log(
        'LOGIN SUCCESS'
      )

      return res.status(200).json({
        token
      })

    } catch (error) {

      console.error(
        'LOGIN ERROR:',
        error
      )

      return res.status(500).json({
        error: 'Login server error',
        details:
          error?.message ||
          String(error)
      })
    }
  }
)

// =====================================================
// PUBLIC CONTENT
// =====================================================

app.get(
  '/api/public',
  async (_req, res) => {

    try {

      await db.read()

      return res.json({

        status:
          db.data.status.filter(
            s => s.active
          ),

        skills:
          db.data.skills,

        projects:
          [...db.data.projects].sort(
            (a, b) =>
              Number(a.number) -
              Number(b.number)
          )
      })

    } catch (error) {

      console.error(
        'PUBLIC CONTENT ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to load public content'
      })
    }
  }
)

// =====================================================
// CONTACT MESSAGES
// =====================================================

app.post(
  '/api/messages',
  async (req, res) => {

    try {

      const name =
        cleanText(
          req.body?.name,
          100
        )

      const number =
        cleanText(
          req.body?.number,
          80
        )

      const project =
        cleanText(
          req.body?.project,
          3000
        )

      const source =
        cleanText(
          req.body?.source || 'contact',
          30
        )

      if (
        !name ||
        !number ||
        !project
      ) {

        return res.status(400).json({
          error:
            'Name, number and project are required'
        })
      }

      await db.read()

      const message = {

        id: id(),

        name,

        number,

        project,

        source:
          source === 'footer'
            ? 'footer'
            : 'hero',

        read: false,

        createdAt:
          new Date().toISOString()
      }

      db.data.messages.unshift(
        message
      )

      await db.write()

      return res.status(201).json({

        ok: true,

        message: {
          id: message.id
        }
      })

    } catch (error) {

      console.error(
        'MESSAGE ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to save message'
      })
    }
  }
)

// =====================================================
// STATUS
// =====================================================

app.get(
  '/api/status',
  auth,
  async (_req, res) => {

    await db.read()

    res.json(
      db.data.status
    )
  }
)

app.post(
  '/api/status',
  auth,
  async (req, res) => {

    const item = {

      id: id(),

      label:
        cleanText(
          req.body?.label,
          120
        ),

      value:
        cleanText(
          req.body?.value ||
          req.body?.label,
          120
        ),

      active:
        req.body?.active !== false
    }

    if (!item.label) {

      return res.status(400).json({
        error: 'Label is required'
      })
    }

    await db.read()

    db.data.status.push(item)

    await db.write()

    res.status(201).json(item)
  }
)

app.put(
  '/api/status/:id',
  auth,
  async (req, res) => {

    await db.read()

    const item =
      db.data.status.find(
        x =>
          x.id === req.params.id
      )

    if (!item) {

      return res.status(404).json({
        error: 'Status not found'
      })
    }

    if (
      req.body.label !== undefined
    ) {

      item.label =
        cleanText(
          req.body.label,
          120
        )
    }

    if (
      req.body.value !== undefined
    ) {

      item.value =
        cleanText(
          req.body.value,
          120
        )
    }

    if (
      req.body.active !== undefined
    ) {

      item.active =
        Boolean(req.body.active)
    }

    await db.write()

    res.json(item)
  }
)

app.delete(
  '/api/status/:id',
  auth,
  async (req, res) => {

    await db.read()

    db.data.status =
      db.data.status.filter(
        x =>
          x.id !== req.params.id
      )

    await db.write()

    res.status(204).end()
  }
)

// =====================================================
// SKILLS
// =====================================================

app.get(
  '/api/skills',
  auth,
  async (_req, res) => {

    await db.read()

    res.json(
      db.data.skills
    )
  }
)

app.post(
  '/api/skills',
  auth,
  async (req, res) => {

    const name =
      cleanText(
        req.body?.name,
        100
      )

    if (!name) {

      return res.status(400).json({
        error: 'Skill name is required'
      })
    }

    const item = {
      id: id(),
      name
    }

    await db.read()

    db.data.skills.push(item)

    await db.write()

    res.status(201).json(item)
  }
)

app.put(
  '/api/skills/:id',
  auth,
  async (req, res) => {

    await db.read()

    const item =
      db.data.skills.find(
        x =>
          x.id === req.params.id
      )

    if (!item) {

      return res.status(404).json({
        error: 'Skill not found'
      })
    }

    item.name =
      cleanText(
        req.body?.name,
        100
      )

    await db.write()

    res.json(item)
  }
)

app.delete(
  '/api/skills/:id',
  auth,
  async (req, res) => {

    await db.read()

    db.data.skills =
      db.data.skills.filter(
        x =>
          x.id !== req.params.id
      )

    await db.write()

    res.status(204).end()
  }
)

// =====================================================
// PROJECTS
// =====================================================

app.get(
  '/api/projects',
  auth,
  async (_req, res) => {

    await db.read()

    res.json(
      [...db.data.projects].sort(
        (a, b) =>
          Number(a.number) -
          Number(b.number)
      )
    )
  }
)

app.post(
  '/api/projects',
  auth,
  upload.single('image'),
  async (req, res) => {

    try {

      const item = {

        id: id(),

        name:
          cleanText(
            req.body?.name,
            150
          ),

        tag:
          cleanText(
            req.body?.tag,
            120
          ),

        image:
          req.file
            ? `/uploads/${req.file.filename}`
            : cleanText(
                req.body?.image,
                500
              ),

        url:
          cleanText(
            req.body?.url,
            1000
          ),

        number:
          cleanText(
            req.body?.number,
            10
          ) ||
          String(
            (db.data.projects?.length || 0) +
            1
          )
      }

      if (
        !item.name ||
        !item.image
      ) {

        if (req.file) {
          fs.unlinkSync(
            req.file.path
          )
        }

        return res.status(400).json({
          error:
            'Name and image are required'
        })
      }

      await db.read()

      db.data.projects.push(item)

      await db.write()

      return res.status(201).json(item)

    } catch (error) {

      console.error(
        'CREATE PROJECT ERROR:',
        error
      )

      if (req.file) {
        try {
          fs.unlinkSync(req.file.path)
        } catch {}
      }

      return res.status(500).json({
        error:
          error?.message ||
          'Failed to create project'
      })
    }
  }
)

app.put(
  '/api/projects/:id',
  auth,
  upload.single('image'),
  async (req, res) => {

    try {

      await db.read()

      const item =
        db.data.projects.find(
          x =>
            x.id === req.params.id
        )

      if (!item) {

        if (req.file) {
          fs.unlinkSync(
            req.file.path
          )
        }

        return res.status(404).json({
          error:
            'Project not found'
        })
      }

      const oldImage =
        item.image

      if (
        req.body.name !== undefined
      ) {

        item.name =
          cleanText(
            req.body.name,
            150
          )
      }

      if (
        req.body.tag !== undefined
      ) {

        item.tag =
          cleanText(
            req.body.tag,
            120
          )
      }

      if (
        req.body.url !== undefined
      ) {

        item.url =
          cleanText(
            req.body.url,
            1000
          )
      }

      if (
        req.body.number !== undefined
      ) {

        item.number =
          cleanText(
            req.body.number,
            10
          )
      }

      if (req.file) {

        item.image =
          `/uploads/${req.file.filename}`
      }

      if (
        !item.name ||
        !item.image
      ) {

        return res.status(400).json({
          error:
            'Name and image are required'
        })
      }

      await db.write()

      if (
        req.file &&
        oldImage?.startsWith(
          '/uploads/'
        )
      ) {

        const oldPath =
          path.join(
            uploadsDir,
            path.basename(oldImage)
          )

        if (
          fs.existsSync(oldPath)
        ) {

          fs.unlinkSync(oldPath)
        }
      }

      return res.json(item)

    } catch (error) {

      console.error(
        'UPDATE PROJECT ERROR:',
        error
      )

      return res.status(500).json({
        error:
          error?.message ||
          'Failed to update project'
      })
    }
  }
)

app.delete(
  '/api/projects/:id',
  auth,
  async (req, res) => {

    await db.read()

    const item =
      db.data.projects.find(
        x =>
          x.id === req.params.id
      )

    if (!item) {

      return res.status(404).json({
        error:
          'Project not found'
      })
    }

    db.data.projects =
      db.data.projects.filter(
        x =>
          x.id !== req.params.id
      )

    await db.write()

    if (
      item.image?.startsWith(
        '/uploads/'
      )
    ) {

      const file =
        path.join(
          uploadsDir,
          path.basename(
            item.image
          )
        )

      if (
        fs.existsSync(file)
      ) {

        fs.unlinkSync(file)
      }
    }

    res.status(204).end()
  }
)

// =====================================================
// ADMIN MESSAGES
// =====================================================

app.get(
  '/api/messages',
  auth,
  async (_req, res) => {

    await db.read()

    res.json(
      db.data.messages
    )
  }
)

app.put(
  '/api/messages/:id/read',
  auth,
  async (req, res) => {

    await db.read()

    const item =
      db.data.messages.find(
        x =>
          x.id === req.params.id
      )

    if (!item) {

      return res.status(404).json({
        error:
          'Message not found'
      })
    }

    item.read = true

    await db.write()

    res.json(item)
  }
)

app.delete(
  '/api/messages/:id',
  auth,
  async (req, res) => {

    await db.read()

    db.data.messages =
      db.data.messages.filter(
        x =>
          x.id !== req.params.id
      )

    await db.write()

    res.status(204).end()
  }
)

// =====================================================
// ADMIN DASHBOARD
// =====================================================

app.get(
  '/admin',
  (_req, res) => {

    res.sendFile(
      path.join(
        adminDir,
        'index.html'
      )
    )
  }
)

// =====================================================
// 404
// =====================================================

app.use(
  (_req, res) => {

    res.status(404).json({
      error: 'Not found'
    })
  }
)

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
  (error, _req, res, _next) => {

    console.error(
      'SERVER ERROR:',
      error
    )

    res.status(500).json({
      error:
        error?.message ||
        'Internal server error'
    })
  }
)

// =====================================================
// START
// =====================================================

app.listen(
  PORT,
  () => {

    console.log(
      `Portfolio admin API running on port ${PORT}`
    )

    console.log(
      `Admin dashboard: /admin`
    )

    console.log(
      `Health check: /api/health`
    )
  }
)