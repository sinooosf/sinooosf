import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import pg from 'pg'

dotenv.config()

// =====================================================
// PATHS
// =====================================================

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootDir = path.resolve(__dirname, '..')

const storageDir = path.join(rootDir, 'storage')
const uploadsDir = path.join(storageDir, 'uploads')
const adminDir = path.join(rootDir, 'admin')

// =====================================================
// CONFIG
// =====================================================

// Render provides PORT automatically.
// Locally it will use 4000.
const PORT = Number(process.env.PORT || 4000)

// No environment variables are required.
const ADMIN_PASSWORD = 'G6dnC'
const JWT_SECRET = 'sinoo-sf-admin-secret-2026'

// =====================================================
// CREATE DIRECTORIES
// =====================================================

fs.mkdirSync(storageDir, { recursive: true })
fs.mkdirSync(uploadsDir, { recursive: true })

// =====================================================
// POSTGRESQL DATABASE
// =====================================================

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000
})

// Without this, a lost/unreachable connection after startup would
// crash the process with an unhandled error and no clear message.
pool.on('error', (error) => {
  console.error('UNEXPECTED DATABASE ERROR:', error)
})

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS status (
      id VARCHAR(100) PRIMARY KEY,
      label VARCHAR(120) NOT NULL,
      value VARCHAR(120) NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS skills (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      tag VARCHAR(120) NOT NULL,
      image VARCHAR(500) NOT NULL,
      url VARCHAR(1000),
      number VARCHAR(10) NOT NULL
    )
  `)

  // Image bytes live in the database instead of on disk, since this
  // service has no persistent disk and would lose files on every restart.
  await pool.query(`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS image_data BYTEA
  `)

  await pool.query(`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS image_mimetype VARCHAR(50)
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      number VARCHAR(80) NOT NULL,
      project TEXT NOT NULL,
      source VARCHAR(30) NOT NULL,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      createdat TIMESTAMP NOT NULL
    )
  `)

  // ---------------------------------------------------
  // INSERT DEFAULT STATUS IF TABLE IS EMPTY
  // ---------------------------------------------------

  const statusCount = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM status
  `)

  if (statusCount.rows[0].count === 0) {
    await pool.query(`
      INSERT INTO status
        (id, label, value, active)
      VALUES
        ($1, $2, $3, $4)
    `, [
      'status-1',
      'Available for Freelance',
      'Available for Freelance',
      true
    ])
  }

  // ---------------------------------------------------
  // INSERT DEFAULT SKILLS IF TABLE IS EMPTY
  // ---------------------------------------------------

  const skillsCount = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM skills
  `)

  if (skillsCount.rows[0].count === 0) {
    const skills = [
      'Web Development',
      'UI/UX Development',
      'Canva',
      'Prompt Engineering',
      'ReactJs / Tailwind',
      'JavaScript',
      'Git',
      'SEO Basics'
    ]

    for (let i = 0; i < skills.length; i++) {
      await pool.query(`
        INSERT INTO skills
          (id, name)
        VALUES
          ($1, $2)
      `, [
        `skill-${i + 1}`,
        skills[i]
      ])
    }
  }

  // ---------------------------------------------------
  // INSERT DEFAULT PROJECTS IF TABLE IS EMPTY
  // ---------------------------------------------------

  const projectsCount = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM projects
  `)

  if (projectsCount.rows[0].count === 0) {
    const projects = [
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
    ]

    for (const project of projects) {
      await pool.query(`
        INSERT INTO projects
          (id, name, tag, image, url, number)
        VALUES
          ($1, $2, $3, $4, $5, $6)
      `, [
        project.id,
        project.name,
        project.tag,
        project.image,
        project.url,
        project.number
      ])
    }
  }

  console.log('PostgreSQL database initialized')
}

try {
  await initDatabase()
} catch (error) {
  console.error('FAILED TO CONNECT TO DATABASE:', error.message)
  console.error('Check that DATABASE_URL in your .env is correct and the database is still active (Render free databases expire after 30 days).')
  process.exit(1)
}

// =====================================================
// EXPRESS
// =====================================================

const app = express()

app.set('trust proxy', 1)

// =====================================================
// CORS
// =====================================================
//
// IMPORTANT:
//
// The frontend and backend are on different Render URLs.
// We are intentionally allowing browser requests from any
// origin because authentication uses a JWT Authorization
// header, NOT cookies.
//
// This avoids the CORS origin problems you were getting.
//
// =====================================================

app.use(
  cors({
    origin: true,
    credentials: false,
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS'
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
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
// MULTER UPLOAD
// =====================================================

// Render's free/starter web services have no persistent disk by default,
// so anything saved to disk (uploadsDir) gets wiped on every restart or
// redeploy. To survive restarts without paying for a disk, uploaded
// images are kept in memory just long enough to save them into Postgres
// (as bytes), instead of being written to a file.
const upload = multer({

  storage: multer.memoryStorage(),

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
      cb(
        new Error(
          'Only JPG, PNG, WEBP and GIF images are allowed'
        )
      )
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
    header
      .replace(/^Bearer\s+/i, '')
      .trim()

  if (!token) {

    return res.status(401).json({
      error: 'Authentication required'
    })
  }

  try {

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      )

    if (
      !decoded ||
      decoded.role !== 'admin'
    ) {

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

function cleanText(
  value,
  max = 500
) {

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

    return res.status(200).json({
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
        String(
          req.body?.password || ''
        )

      console.log(
        'Password received:',
        password ? 'YES' : 'NO'
      )

      if (
        password !== ADMIN_PASSWORD
      ) {

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

      const statusResult = await pool.query(`
        SELECT id, label, value, active
        FROM status
      `)

      const skillsResult = await pool.query(`
        SELECT id, name
        FROM skills
      `)

      const projectsResult = await pool.query(`
        SELECT id, name, tag, image, url, number
        FROM projects
      `)

      const status = statusResult.rows
      const skills = skillsResult.rows
      const projects = projectsResult.rows


      return res.status(200).json({

        status:
          status.filter(
            item => item.active
          ),

        skills,

        projects:
          [...projects].sort(
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
// PROJECT IMAGE (served from the database, not disk)
// =====================================================

app.get(
  '/api/projects/:id/image',
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT image_data, image_mimetype
          FROM projects
          WHERE id = $1
        `, [
          req.params.id
        ])

      const row = result.rows[0]

      if (!row || !row.image_data) {

        return res.status(404).end()
      }

      res.set(
        'Content-Type',
        row.image_mimetype || 'image/jpeg'
      )

      res.set(
        'Cache-Control',
        'public, max-age=86400'
      )

      return res.send(
        row.image_data
      )

    } catch (error) {

      console.error(
        'GET PROJECT IMAGE ERROR:',
        error
      )

      return res.status(500).end()
    }
  }
)

// =====================================================
// CONTACT MESSAGES - PUBLIC
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

      const messageId = id()

      const messageSource =
        source === 'footer'
          ? 'footer'
          : 'hero'

      const createdAt =
        new Date()

      await pool.query(`
        INSERT INTO messages
          (
            id,
            name,
            number,
            project,
            source,
            read,
            createdat
          )
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
      `, [
        messageId,
        name,
        number,
        project,
        messageSource,
        false,
        createdAt
      ])

      return res.status(201).json({

        ok: true,

        message: {
          id: messageId
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
// =====================================================
// STATUS
// =====================================================

app.get(
  '/api/status',
  auth,
  async (_req, res) => {

    try {

      const result = await pool.query(`
        SELECT
          id,
          label,
          value,
          active
        FROM status
        ORDER BY id
      `)

      return res.json(
        result.rows
      )

    } catch (error) {

      console.error(
        'GET STATUS ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to load status'
      })
    }
  }
)

app.post(
  '/api/status',
  auth,
  async (req, res) => {

    try {

      const label =
        cleanText(
          req.body?.label,
          120
        )

      const value =
        cleanText(
          req.body?.value || label,
          120
        )

      const active =
        req.body?.active !== false

      if (!label) {

        return res.status(400).json({
          error:
            'Label is required'
        })
      }

      const item = {
        id: id(),
        label,
        value,
        active
      }

      await pool.query(`
        INSERT INTO status
          (id, label, value, active)
        VALUES
          ($1, $2, $3, $4)
      `, [
        item.id,
        item.label,
        item.value,
        item.active
      ])

      return res.status(201).json(
        item
      )

    } catch (error) {

      console.error(
        'CREATE STATUS ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to create status'
      })
    }
  }
)

app.put(
  '/api/status/:id',
  auth,
  async (req, res) => {

    try {

      const existing =
        await pool.query(`
          SELECT
            id,
            label,
            value,
            active
          FROM status
          WHERE id = $1
        `, [
          req.params.id
        ])

      if (existing.rows.length === 0) {

        return res.status(404).json({
          error:
            'Status not found'
        })
      }

      const current =
        existing.rows[0]

      const label =
        req.body.label !== undefined
          ? cleanText(req.body.label, 120)
          : current.label

      const value =
        req.body.value !== undefined
          ? cleanText(req.body.value, 120)
          : current.value

      const active =
        req.body.active !== undefined
          ? Boolean(req.body.active)
          : current.active

      if (!label) {

        return res.status(400).json({
          error:
            'Label is required'
        })
      }

      const result =
        await pool.query(`
          UPDATE status
          SET
            label = $1,
            value = $2,
            active = $3
          WHERE id = $4
          RETURNING
            id,
            label,
            value,
            active
        `, [
          label,
          value,
          active,
          req.params.id
        ])

      return res.json(
        result.rows[0]
      )

    } catch (error) {

      console.error(
        'UPDATE STATUS ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to update status'
      })
    }
  }
)

app.delete(
  '/api/status/:id',
  auth,
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          DELETE FROM status
          WHERE id = $1
        `, [
          req.params.id
        ])

      if (result.rowCount === 0) {

        return res.status(404).json({
          error:
            'Status not found'
        })
      }

      return res.status(204).end()

    } catch (error) {

      console.error(
        'DELETE STATUS ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to delete status'
      })
    }
  }
)

// =====================================================
// SKILLS
// =====================================================

app.get(
  '/api/skills',
  auth,
  async (_req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
            id,
            name
          FROM skills
          ORDER BY id
        `)

      return res.json(
        result.rows
      )

    } catch (error) {

      console.error(
        'GET SKILLS ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to load skills'
      })
    }
  }
)

app.post(
  '/api/skills',
  auth,
  async (req, res) => {

    try {

      const name =
        cleanText(
          req.body?.name,
          100
        )

      if (!name) {

        return res.status(400).json({
          error:
            'Skill name is required'
        })
      }

      const item = {
        id: id(),
        name
      }

      await pool.query(`
        INSERT INTO skills
          (id, name)
        VALUES
          ($1, $2)
      `, [
        item.id,
        item.name
      ])

      return res.status(201).json(
        item
      )

    } catch (error) {

      console.error(
        'CREATE SKILL ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to create skill'
      })
    }
  }
)

app.put(
  '/api/skills/:id',
  auth,
  async (req, res) => {

    try {

      const name =
        cleanText(
          req.body?.name,
          100
        )

      if (!name) {

        return res.status(400).json({
          error:
            'Skill name is required'
        })
      }

      const result =
        await pool.query(`
          UPDATE skills
          SET name = $1
          WHERE id = $2
          RETURNING id, name
        `, [
          name,
          req.params.id
        ])

      if (result.rows.length === 0) {

        return res.status(404).json({
          error:
            'Skill not found'
        })
      }

      return res.json(
        result.rows[0]
      )

    } catch (error) {

      console.error(
        'UPDATE SKILL ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to update skill'
      })
    }
  }
)

app.delete(
  '/api/skills/:id',
  auth,
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          DELETE FROM skills
          WHERE id = $1
        `, [
          req.params.id
        ])

      if (result.rowCount === 0) {

        return res.status(404).json({
          error:
            'Skill not found'
        })
      }

      return res.status(204).end()

    } catch (error) {

      console.error(
        'DELETE SKILL ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to delete skill'
      })
    }
  }
)

// =====================================================
// PROJECTS
// =====================================================

app.get(
  '/api/projects',
  auth,
  async (_req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
            id,
            name,
            tag,
            image,
            url,
            number
          FROM projects
          ORDER BY
            CAST(number AS INTEGER) ASC
        `)

      return res.json(
        result.rows
      )

    } catch (error) {

      console.error(
        'GET PROJECTS ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to load projects'
      })
    }
  }
)

// =====================================================
// CREATE PROJECT
// =====================================================

app.post(
  '/api/projects',
  auth,
  upload.single('image'),
  async (req, res) => {

    try {

      const name =
        cleanText(
          req.body?.name,
          150
        )

      const tag =
        cleanText(
          req.body?.tag,
          120
        )

      const url =
        cleanText(
          req.body?.url,
          1000
        )

      if (!name || !req.file) {

        return res.status(400).json({
          error:
            'Name and image are required'
        })
      }

      const countResult =
        await pool.query(`
          SELECT COUNT(*)::int AS count
          FROM projects
        `)

      const number =
        cleanText(
          req.body?.number,
          10
        ) ||
        String(
          countResult.rows[0].count + 1
        )

      const projectId = id()

      // The image itself lives in the database (image_data). This
      // "image" field is just the URL the browser fetches it from.
      const image = `/api/projects/${projectId}/image`

      const item = {
        id: projectId,
        name,
        tag,
        image,
        url,
        number
      }

      await pool.query(`
        INSERT INTO projects
          (
            id,
            name,
            tag,
            image,
            url,
            number,
            image_data,
            image_mimetype
          )
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        item.id,
        item.name,
        item.tag,
        item.image,
        item.url,
        item.number,
        req.file.buffer,
        req.file.mimetype
      ])

      return res.status(201).json(
        item
      )

    } catch (error) {

      console.error(
        'CREATE PROJECT ERROR:',
        error
      )

      return res.status(500).json({
        error:
          error?.message ||
          'Failed to create project'
      })
    }
  }
)

// =====================================================
// UPDATE PROJECT
// =====================================================

app.put(
  '/api/projects/:id',
  auth,
  upload.single('image'),
  async (req, res) => {

    try {

      const existing =
        await pool.query(`
          SELECT
            id,
            name,
            tag,
            image,
            url,
            number
          FROM projects
          WHERE id = $1
        `, [
          req.params.id
        ])

      if (existing.rows.length === 0) {

        return res.status(404).json({
          error:
            'Project not found'
        })
      }

      const current =
        existing.rows[0]

      const name =
        req.body.name !== undefined
          ? cleanText(req.body.name, 150)
          : current.name

      const tag =
        req.body.tag !== undefined
          ? cleanText(req.body.tag, 120)
          : current.tag

      const url =
        req.body.url !== undefined
          ? cleanText(req.body.url, 1000)
          : current.url

      const number =
        req.body.number !== undefined
          ? cleanText(req.body.number, 10)
          : current.number

      const image =
        req.file
          ? `/api/projects/${req.params.id}/image`
          : current.image

      if (!name || !image) {

        return res.status(400).json({
          error:
            'Name and image are required'
        })
      }

      const result =
        req.file
          ? await pool.query(`
              UPDATE projects
              SET
                name = $1,
                tag = $2,
                image = $3,
                url = $4,
                number = $5,
                image_data = $6,
                image_mimetype = $7
              WHERE id = $8
              RETURNING
                id,
                name,
                tag,
                image,
                url,
                number
            `, [
              name,
              tag,
              image,
              url,
              number,
              req.file.buffer,
              req.file.mimetype,
              req.params.id
            ])
          : await pool.query(`
              UPDATE projects
              SET
                name = $1,
                tag = $2,
                image = $3,
                url = $4,
                number = $5
              WHERE id = $6
              RETURNING
                id,
                name,
                tag,
                image,
                url,
                number
            `, [
              name,
              tag,
              image,
              url,
              number,
              req.params.id
            ])

      return res.json(
        result.rows[0]
      )

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

// =====================================================
// DELETE PROJECT
// =====================================================

app.delete(
  '/api/projects/:id',
  auth,
  async (req, res) => {

    try {

      const existing =
        await pool.query(`
          SELECT id
          FROM projects
          WHERE id = $1
        `, [
          req.params.id
        ])

      if (existing.rows.length === 0) {

        return res.status(404).json({
          error:
            'Project not found'
        })
      }

      await pool.query(`
        DELETE FROM projects
        WHERE id = $1
      `, [
        req.params.id
      ])

      return res.status(204).end()

    } catch (error) {

      console.error(
        'DELETE PROJECT ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to delete project'
      })
    }
  }
)
// =====================================================
// ADMIN MESSAGES
// =====================================================

app.get(
  '/api/messages',
  auth,
  async (_req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
            id,
            name,
            number,
            project,
            source,
            read,
            createdat
          FROM messages
          ORDER BY createdat DESC
        `)

      return res.json(
        result.rows
      )

    } catch (error) {

      console.error(
        'GET MESSAGES ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to load messages'
      })
    }
  }
)

// =====================================================
// MARK MESSAGE AS READ
// =====================================================

app.put(
  '/api/messages/:id/read',
  auth,
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          UPDATE messages
          SET read = TRUE
          WHERE id = $1
          RETURNING
            id,
            name,
            number,
            project,
            source,
            read,
            createdat
        `, [
          req.params.id
        ])

      if (result.rows.length === 0) {

        return res.status(404).json({
          error:
            'Message not found'
        })
      }

      return res.json(
        result.rows[0]
      )

    } catch (error) {

      console.error(
        'READ MESSAGE ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to update message'
      })
    }
  }
)

// =====================================================
// DELETE MESSAGE
// =====================================================

app.delete(
  '/api/messages/:id',
  auth,
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          DELETE FROM messages
          WHERE id = $1
        `, [
          req.params.id
        ])

      if (result.rowCount === 0) {

        return res.status(404).json({
          error:
            'Message not found'
        })
      }

      return res.status(204).end()

    } catch (error) {

      console.error(
        'DELETE MESSAGE ERROR:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to delete message'
      })
    }
  }
)

// =====================================================
// ADMIN DASHBOARD
// =====================================================

app.get(
  '/admin',
  (_req, res) => {

    const adminIndex =
      path.join(
        adminDir,
        'index.html'
      )

    if (
      !fs.existsSync(adminIndex)
    ) {

      return res.status(404).send(
        'Admin dashboard not found'
      )
    }

    return res.sendFile(
      adminIndex
    )
  }
)

// =====================================================
// API 404
// =====================================================

app.use(
  (_req, res) => {

    return res.status(404).json({
      error: 'Not found'
    })
  }
)

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (error, _req, res, _next) => {

    console.error(
      'SERVER ERROR:',
      error
    )

    return res.status(500).json({
      error:
        error?.message ||
        'Internal server error'
    })
  }
)

// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,
  '0.0.0.0',
  () => {

    console.log(
      `Portfolio admin API running on port ${PORT}`
    )

    console.log(
      `Health check: /api/health`
    )

    console.log(
      `Admin dashboard: /admin`
    )

    console.log(
      `JWT authentication enabled`
    )
  }
)