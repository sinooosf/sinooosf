import { MagnifyingGlass, Lightbulb, PenNib, Code, PaperPlaneRight, Quotes } from '@phosphor-icons/react'
import Reveal from './Reveal';
import RedBg from '../assests/2red-bg.jpg'
import { useEffect, useState } from 'react'
import { fetchPublicContent } from '../lib/api'

const skills = [
  'Web Development', 'UI/UX Development', 'Canva',
  'Prompt ngineering', 'ReactJs / Tailwind',
  'JavaScript', 'Git', 'SEO Basics',
]

// A genuine sequence, so numbering the steps actually communicates order.
const processSteps = [
  { icon: MagnifyingGlass, title: 'Discover', text: 'Understanding goals, audience, and project requirements.' },
  { icon: Lightbulb, title: 'Ideate', text: 'Planning, wireframing, and creating the right concept.' },
  { icon: PenNib, title: 'Design', text: 'Crafting visual design with a focus on user experience.' },
  { icon: Code, title: 'Develop', text: 'Building fast, responsive, and high-performing websites.' },
  { icon: PaperPlaneRight, title: 'Deliver', text: 'Testing, optimizing, and launching with perfection.' },
]

export default function EducationProcess() {
  const [skillList, setSkillList] = useState(skills)

  useEffect(() => {
    fetchPublicContent()
      .then((data) => {
        if (Array.isArray(data.skills)) setSkillList(data.skills.map((skill) => skill.name || skill).filter(Boolean))
      })
      .catch(() => {})
  }, [])

  return (
   <section className="border-y border-red-900/80">
  <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.2fr_0.65fr]">

    {/* ================= EDUCATION & SKILLS ================= */}
<Reveal className="border-b border-red-900/80 p-6 md:border-b-0 md:border-r">

  <h2 className="font-display text-xl text-bone sm:text-2xl">
    Journey & Skills
  </h2>

  <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-blood">
    My Journey
  </p>

  <div className="mt-4 space-y-4">

    <div className="border-b border-line pb-4">
      <p className="text-sm font-semibold text-bone">
        Self-Taught Web Developer
      </p>

      <p className="mt-1 text-xs leading-relaxed text-smoke">
        Learned through hands-on practice, documentation, experimentation,
        and building real-world projects.
      </p>
    </div>

  </div>

  <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-blood">
    Skills
  </p>

  <div className="mt-4 flex flex-wrap gap-2">
    {skillList.map((skill) => (
      <span
        key={skill}
        className="cursor-default rounded-full border border-line px-3 py-1.5 text-xs text-bone/90 transition-all duration-200 hover:-translate-y-0.5 hover:border-blood hover:text-blood"
      >
        {skill}
      </span>
    ))}
  </div>

</Reveal>


    {/* ================= WORK PROCESS ================= */}
    <Reveal
      delay={100}
      className="border-b border-red-900/80 p-6 md:border-b-0 md:border-r"
    >

      <h2 className="font-display text-xl text-bone sm:text-2xl">
        Work Process
      </h2>

      <ol className="mt-8">

        {processSteps.map((step, i) => {
          const Icon = step.icon

          return (
            <li
              key={step.title}
              className="group flex items-start gap-4"
            >

              <div className='flex gap-5'>

                <p className="text-lg mt-2 font-semibold text-blood">
                  {String(i + 1).padStart(2, '0')}
                </p>
                {/* ICON + LINE */}
              <div className="flex flex-col items-center">

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blood/50 text-blood transition-all duration-300 group-hover:bg-blood group-hover:text-bone">
                  <Icon size={18} weight="bold" />
                </span>

                {i < processSteps.length - 1 && (
                  <span className="mt-1 h-6 w-px bg-line" />
                )}

              </div>
              </div>
              
              {/* TEXT */}
              <div className="min-w-0">

                <p className="text-xs font-semibold text-blood">
                  {step.title.toUpperCase()}
                </p>

                <p className="mt-1 text-sm text-smoke">
                  {step.text}
                </p>

              </div>

            </li>
          )
        })}

      </ol>

    </Reveal>


    {/* ================= QUOTE ================= */}
    <Reveal
      delay={200}
      className="min-h-[400px] overflow-hidden"
    >

      <div
        className="flex h-full min-h-[400px] flex-col justify-between bg-cover bg-center bg-no-repeat p-6"
        style={{
          backgroundImage: `url(${RedBg})`,
        }}
      >

        <div>

          <Quotes
            size={39}
            weight="fill"
            className="text-blood rotate-180"
          />

          <p className="mt-4 font-display text-lg leading-snug text-bone" style={{fontFamily: 'cursive'}}>
            Good design <br/>is not just how it looks,<br/> but how it works.
          </p>

          <p className="mt-9 text-xl text-white" style={{
                    fontFamily: '"Tangerine", cursive',
                  }}>
            SINOO
          </p>

        </div>

        <div className='flex flex-row-reverse content-start gap-2'>
        <p className="font-display text-sm text-bone " >
          LET'S CREATE
          <br />
          SOMETHING GREAT TOGETHER.
        </p>
        <span className="text-blood text-3xl text-center">✦</span>
        </div>

      </div>

    </Reveal>

  </div>
</section>
  )
}
