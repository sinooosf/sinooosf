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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const storageDir = path.join(rootDir, 'storage')
const uploadsDir = path.join(storageDir, 'uploads')
const dbPath = path.join(storageDir, 'db.json')
const adminDir = path.join(rootDir, 'admin')
const PORT = Number(process.env.PORT || 4000)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'G6dnC'
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production'
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*'

fs.mkdirSync(uploadsDir, { recursive: true })

const defaultData = {
  status: [
    { id: 'status-1', label: 'Available for Freelance', value: 'Available for Freelance', active: true }
  ],
  skills: [
    'Web Development', 'UI/UX Development', 'Canva',
    'Prompt Engineering', 'ReactJs / Tailwind', 'JavaScript', 'Git', 'SEO Basics'
  ].map((name, i) => ({ id: `skill-${i + 1}`, name })),
  projects: [
    { id: '01', name: 'Veloce Bikes', tag: 'E-Commerce Website', image: '/uploads/firstpro.jpg', url: '', number: '01' },
    { id: '02', name: 'Woodcraft', tag: 'Furniture Website', image: '/uploads/seconde.jpg', url: '', number: '02' },
    { id: '03', name: 'Urbanic', tag: 'Fashion Magazine', image: '/uploads/third.jpg', url: '', number: '03' },
    { id: '04', name: 'NEON', tag: 'Fashion Magazine', image: '/uploads/forthproject.jpg', url: '', number: '04' },
    { id: '05', name: 'BOOKS', tag: 'Fashion Magazine', image: '/uploads/thirdproject.jpg', url: '', number: '05' },
    { id: '06', name: 'PORTFOLIO', tag: 'Fashion Magazine', image: '/uploads/secondeproject.jpg', url: '', number: '06' }
  ],
  messages: []
}

const db = await JSONFilePreset(dbPath, defaultData)

const app = express()
app.set('trust proxy', 1)
const allowedOrigins = FRONTEND_ORIGIN === '*' ? null : FRONTEND_ORIGIN.split(',').map(s => s.trim())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !allowedOrigins || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('CORS origin not allowed'))
  },
  credentials: true
}))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(uploadsDir))
app.use('/admin', express.static(adminDir))

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9-_]/gi, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)
    cb(null, `${Date.now()}-${base || 'project'}${ext}`)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    cb(null, allowed.includes(file.mimetype))
  }
})

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    req.admin = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired' })
  }
}

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function cleanText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max)
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.post('/api/auth/login', (req, res) => {
  const password = String(req.body?.password || '')
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid password' })
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

app.get('/api/public', async (_req, res) => {
  await db.read()
  res.json({
    status: db.data.status.filter(s => s.active),
    skills: db.data.skills,
    projects: [...db.data.projects].sort((a, b) => Number(a.number) - Number(b.number))
  })
})

app.post('/api/messages', async (req, res) => {
  const name = cleanText(req.body?.name, 100)
  const number = cleanText(req.body?.number, 80)
  const project = cleanText(req.body?.project, 3000)
  const source = cleanText(req.body?.source || 'contact', 30)

  if (!name || !number || !project) {
    return res.status(400).json({ error: 'Name, number and project are required' })
  }

  await db.read()
  const message = {
    id: id(),
    name,
    number,
    project,
    source: source === 'footer' ? 'footer' : 'hero',
    read: false,
    createdAt: new Date().toISOString()
  }
  db.data.messages.unshift(message)
  await db.write()
  res.status(201).json({ ok: true, message: { id: message.id } })
})

app.get('/api/status', auth, async (_req, res) => { await db.read(); res.json(db.data.status) })
app.post('/api/status', auth, async (req, res) => {
  const item = { id: id(), label: cleanText(req.body?.label, 120), value: cleanText(req.body?.value || req.body?.label, 120), active: req.body?.active !== false }
  if (!item.label) return res.status(400).json({ error: 'Label is required' })
  await db.read(); db.data.status.push(item); await db.write(); res.status(201).json(item)
})
app.put('/api/status/:id', auth, async (req, res) => {
  await db.read()
  const item = db.data.status.find(x => x.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Status not found' })
  if (req.body.label !== undefined) item.label = cleanText(req.body.label, 120)
  if (req.body.value !== undefined) item.value = cleanText(req.body.value, 120)
  if (req.body.active !== undefined) item.active = Boolean(req.body.active)
  await db.write(); res.json(item)
})
app.delete('/api/status/:id', auth, async (req, res) => {
  await db.read(); db.data.status = db.data.status.filter(x => x.id !== req.params.id); await db.write(); res.status(204).end()
})

app.get('/api/skills', auth, async (_req, res) => { await db.read(); res.json(db.data.skills) })
app.post('/api/skills', auth, async (req, res) => {
  const name = cleanText(req.body?.name, 100)
  if (!name) return res.status(400).json({ error: 'Skill name is required' })
  const item = { id: id(), name }
  await db.read(); db.data.skills.push(item); await db.write(); res.status(201).json(item)
})
app.put('/api/skills/:id', auth, async (req, res) => {
  await db.read()
  const item = db.data.skills.find(x => x.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Skill not found' })
  item.name = cleanText(req.body?.name, 100)
  await db.write(); res.json(item)
})
app.delete('/api/skills/:id', auth, async (req, res) => {
  await db.read(); db.data.skills = db.data.skills.filter(x => x.id !== req.params.id); await db.write(); res.status(204).end()
})

app.get('/api/projects', auth, async (_req, res) => { await db.read(); res.json([...db.data.projects].sort((a,b) => Number(a.number)-Number(b.number))) })
app.post('/api/projects', auth, upload.single('image'), async (req, res) => {
  const item = {
    id: id(),
    name: cleanText(req.body?.name, 150),
    tag: cleanText(req.body?.tag, 120),
    image: req.file ? `/uploads/${req.file.filename}` : cleanText(req.body?.image, 500),
    url: cleanText(req.body?.url, 1000),
    number: cleanText(req.body?.number, 10) || String((db.data.projects?.length || 0) + 1)
  }
  if (!item.name || !item.image) {
    if (req.file) fs.unlinkSync(req.file.path)
    return res.status(400).json({ error: 'Name and image are required' })
  }
  await db.read(); db.data.projects.push(item); await db.write(); res.status(201).json(item)
})
app.put('/api/projects/:id', auth, upload.single('image'), async (req, res) => {
  await db.read()
  const item = db.data.projects.find(x => x.id === req.params.id)
  if (!item) {
    if (req.file) fs.unlinkSync(req.file.path)
    return res.status(404).json({ error: 'Project not found' })
  }
  const oldImage = item.image
  if (req.body.name !== undefined) item.name = cleanText(req.body.name, 150)
  if (req.body.tag !== undefined) item.tag = cleanText(req.body.tag, 120)
  if (req.body.url !== undefined) item.url = cleanText(req.body.url, 1000)
  if (req.body.number !== undefined) item.number = cleanText(req.body.number, 10)
  if (req.file) item.image = `/uploads/${req.file.filename}`
  if (!item.name || !item.image) return res.status(400).json({ error: 'Name and image are required' })
  await db.write()
  if (req.file && oldImage?.startsWith('/uploads/')) {
    const oldPath = path.join(uploadsDir, path.basename(oldImage))
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
  }
  res.json(item)
})
app.delete('/api/projects/:id', auth, async (req, res) => {
  await db.read()
  const item = db.data.projects.find(x => x.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Project not found' })
  db.data.projects = db.data.projects.filter(x => x.id !== req.params.id)
  await db.write()
  if (item.image?.startsWith('/uploads/')) {
    const file = path.join(uploadsDir, path.basename(item.image))
    if (fs.existsSync(file)) fs.unlinkSync(file)
  }
  res.status(204).end()
})

app.get('/api/messages', auth, async (_req, res) => { await db.read(); res.json(db.data.messages) })
app.put('/api/messages/:id/read', auth, async (req, res) => {
  await db.read()
  const item = db.data.messages.find(x => x.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Message not found' })
  item.read = true
  await db.write(); res.json(item)
})
app.delete('/api/messages/:id', auth, async (req, res) => {
  await db.read(); db.data.messages = db.data.messages.filter(x => x.id !== req.params.id); await db.write(); res.status(204).end()
})

app.get('/admin', (_req, res) => res.sendFile(path.join(adminDir, 'index.html')))
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

app.listen(PORT, () => {
  console.log(`Portfolio admin API running on http://localhost:${PORT}`)
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`)
})
