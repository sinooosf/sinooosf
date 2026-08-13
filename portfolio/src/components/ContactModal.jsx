import { useEffect, useState } from 'react'
import { X, PaperPlaneTilt, CheckCircle } from '@phosphor-icons/react'
import { sendContactMessage } from '../lib/api'

const TRANSITION_MS = 300

export default function ContactModal({ open, onClose }) {
  // `mounted` keeps the modal in the DOM long enough to play the exit
  // transition; `shown` toggles the actual opacity/scale classes.
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle' | 'sent' | 'error'
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', number: '', project: '' })

  useEffect(() => {
    if (open) {
      setMounted(true)
      // let the element paint at opacity-0 first, then animate in
      const raf = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(raf)
    }
    setShown(false)
    const timeout = setTimeout(() => {
      setMounted(false)
      setStatus('idle')
      setForm({ name: '', number: '', project: '' })
    }, TRANSITION_MS)
    return () => clearTimeout(timeout)
  }, [open])

  // Close on Escape + lock background scroll while open
  useEffect(() => {
    if (!mounted) return
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [mounted, onClose])

  if (!mounted) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      await sendContactMessage({ ...form, source: 'hero' })
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Could not send your message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-300 ${
        shown ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      {/* Backdrop */}
      <button
        aria-label="Close contact form"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
      />

      {/* Panel */}
      <div
        className={`relative w-full max-w-md rounded-2xl border border-line bg-panel p-6 sm:p-8 shadow-2xl transition-all duration-300 ease-out ${
          shown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-smoke transition-colors hover:text-bone"
        >
          <X size={22} />
        </button>

        {status === 'idle' ? (
          <>
            <h3 id="contact-modal-title" className="font-display text-xl text-bone sm:text-2xl">
              Let's work together
            </h3>
            <p className="mt-2 text-sm text-smoke">
              Tell me a bit about your project and I'll get back to you.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-smoke">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-bone outline-none transition-colors focus:border-blood"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="number" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-smoke">
                  Number
                </label>
                <input
                  id="number"
                  type="tel"
                  required
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-bone outline-none transition-colors focus:border-blood"
                  placeholder="+62 812 3456 7890"
                />
              </div>

              <div>
                <label htmlFor="project" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-smoke">
                  Tell me about your project
                </label>
                <textarea
                  id="project"
                  required
                  rows={4}
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                  className="w-full resize-none rounded-lg border border-line bg-ink px-4 py-2.5 text-bone outline-none transition-colors focus:border-blood"
                  placeholder="What are you building?"
                />
              </div>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blood px-5 py-3 font-semibold text-bone transition-all hover:bg-blood-dim active:scale-[0.98]"
              >
                {sending ? 'Sending...' : 'Send'}
                <PaperPlaneTilt size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center py-8 text-center animate-fadeUp">
            <CheckCircle size={48} weight="fill" className="text-blood" />
            <p className="mt-4 text-lg font-semibold text-bone">Thanks, I'll respond very soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
