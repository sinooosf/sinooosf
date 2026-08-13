import {
  EnvelopeSimple,
  Globe,
  Phone,
  MapPin,
  ShareNetwork,
  PaperPlaneTilt,
  CheckCircle,
} from '@phosphor-icons/react'
import { useState } from 'react'
import Reveal from './Reveal'
import { sendContactMessage } from '../lib/api'


const contactItems = [
  { icon: EnvelopeSimple, text: 'sinooosf@gmail.com' },
  { icon: Globe, text: 'www.sinooosf.com' },
  { icon: Phone, text: '+213 559 25 01 96' },
  { icon: MapPin, text: 'Algeria , Tipaza' },
]


export default function Footer() {
  const [status, setStatus] = useState('idle')

  const [form, setForm] = useState({
    name: '',
    number: '',
    project: '',
  })


  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      await sendContactMessage({ ...form, source: 'footer' })
      setStatus('sent')
    } catch (err) {
      setError(err.message || 'Could not send your message. Please try again.')
    } finally {
      setSending(false)
    }
  }


  return (
    <footer className="px-5 py-16 sm:px-10 sm:pt-10 sm:pb-5">

      {/* MAIN FOOTER */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr_1.3fr] lg:items-stretch">


        {/* =========================================
            LEFT — INTRO
        ========================================= */}
        <Reveal className="flex h-full flex-col">

          <h2 className="font-display text-2xl text-bone sm:text-3xl">
            LET'S WORK
            <br />
            TOGETHER
          </h2>


          <p className="mt-4 max-w-sm text-sm leading-6 text-smoke">
            I'm currently open for new projects and collaborations. Let's
            create something amazing that drives results.
          </p>


          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blood">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-blood">
              <ShareNetwork
                size={16}
                weight="bold"
              />
            </span>

            Available for Freelance
          </div>

        </Reveal>



        {/* =========================================
            MIDDLE — CONTACT INFO
        ========================================= */}
        <Reveal
          delay={100}
          className="flex h-full flex-col"
        >

          <div className="space-y-4">

            {contactItems.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 border-b border-line pb-4 text-sm text-bone/90"
              >

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-blood">
                  <Icon size={16} />
                </span>


                <span className="break-all">
                  {text}
                </span>

              </div>
            ))}

          </div>

        </Reveal>



        {/* =========================================
            RIGHT — CONTACT FORM
        ========================================= */}
        <Reveal
          delay={200}
          className="flex h-full flex-col"
        >

          {status === 'idle' ? (
            <>

              <h3 className="font-display text-xl text-bone sm:text-2xl">
                Let's work together
              </h3>


              <p className="mt-2 text-sm leading-5 text-smoke">
                Tell me a bit about your project and I'll get back to you.
              </p>


              <form
                onSubmit={handleSubmit}
                className="mt-4 flex flex-1 flex-col"
              >

                <div className="space-y-3">


                  {/* NAME + NUMBER */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {/* NAME */}
                    <div>

                      <label
                        htmlFor="footer-name"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-smoke"
                      >
                        Name
                      </label>


                      <input
                        id="footer-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            name: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-bone outline-none transition-colors placeholder:text-smoke/50 focus:border-blood"
                        placeholder="Your name"
                      />

                    </div>



                    {/* NUMBER */}
                    <div>

                      <label
                        htmlFor="footer-number"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-smoke"
                      >
                        Number
                      </label>


                      <input
                        id="footer-number"
                        type="tel"
                        required
                        value={form.number}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            number: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-bone outline-none transition-colors placeholder:text-smoke/50 focus:border-blood"
                        placeholder="+213 559 25 01 96"
                      />

                    </div>

                  </div>



                  {/* PROJECT */}
                  <div>

                    <label
                      htmlFor="footer-project"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-smoke"
                    >
                      Tell me about your project
                    </label>


                    <textarea
                      id="footer-project"
                      required
                      rows={3}
                      value={form.project}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          project: e.target.value,
                        })
                      }
                      className="w-full resize-none rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-bone outline-none transition-colors placeholder:text-smoke/50 focus:border-blood"
                      placeholder="What are you building?"
                    />

                  </div>

                </div>



                {error && <p className="text-xs text-blood">{error}</p>}

                {/* SEND */}
                <button
                  type="submit"
                  className="group mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-blood px-5 py-3 text-sm font-semibold text-bone transition-all hover:bg-blood-dim active:scale-[0.98]"
                >
                  {sending ? 'Sending...' : 'Send'}

                  <PaperPlaneTilt
                    size={18}
                    weight="bold"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

              </form>

            </>
          ) : (

            /* SUCCESS */
            <div className="flex h-full flex-col items-center justify-center py-8 text-center animate-fadeUp">

              <CheckCircle
                size={48}
                weight="fill"
                className="text-blood"
              />


              <p className="mt-4 text-lg font-semibold text-bone">
                Thanks, I'll respond very soon
              </p>


              <button
                onClick={() => {
                  setStatus('idle')

                  setForm({
                    name: '',
                    number: '',
                    project: '',
                  })
                }}
                className="mt-4 text-sm text-smoke transition-colors hover:text-bone"
              >
                Send another message
              </button>

            </div>

          )}

        </Reveal>

      </div>



      {/* =========================================
          BOTTOM
      ========================================= */}
      <div className="mx-auto mt-10 max-w-6xl border-t border-red-900/80 pt-6">

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

          {/* LEFT */}
          <div>

            <p className="text-sm font-semibold tracking-wide text-bone">
              SINOO SF
            </p>


            <p className="mt-2 max-w-md text-xs leading-5 text-smoke">
              Independent developer focused on building modern, thoughtful,
              and high-performing digital experiences.
            </p>

          </div>



          {/* RIGHT */}
          <div className="flex flex-col gap-1 text-xs text-smoke sm:items-end">

            <p>
              Available for freelance projects
            </p>

            <p>
              Based in Algeria · Working worldwide
            </p>

          </div>

        </div>



        {/* COPYRIGHT */}
        <div className="mt-6 flex flex-col gap-2 border-t border-line pt-4 text-xs text-smoke sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} SINOO SF. All rights reserved.
          </p>


          <p>
            Designed &amp; built with React &amp; Tailwind CSS.
          </p>

        </div>

      </div>

    </footer>
  )
}