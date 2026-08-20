import { ArrowRight } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import useIsMobile from '../hooks/useIsMobile'
import firstimg from '../assests/projects-imgs/firstpro.jpg'
import secondeimg from '../assests/projects-imgs/seconde.jpg'
import thirdimg from '../assests/projects-imgs/third.jpg'
import forth from '../assests/projects-imgs/forthproject.jpg'
import fiveth from '../assests/projects-imgs/thirdproject.jpg'
import sexth from '../assests/projects-imgs/secondeproject.jpg'
import { apiUrl, fetchPublicContent } from '../lib/api'

const fallbackProjects = [
  { id: '01', name: 'Veloce Bikes', tag: 'E-Commerce Website', image: firstimg, number: '01', url: '' },
  { id: '02', name: 'Woodcraft', tag: 'Furniture Website', image: secondeimg, number: '02', url: '' },
  { id: '03', name: 'Urbanic', tag: 'Fashion Magazine', image: thirdimg, number: '03', url: '' },
  { id: '04', name: 'NEON', tag: 'Fashion Magazine', image: forth, number: '04', url: '' },
  { id: '05', name: 'BOOKS', tag: 'Fashion Magazine', image: fiveth, number: '05', url: '' },
  { id: '06', name: 'PORTFOLIO', tag: 'Fashion Magazine', image: sexth, number: '06', url: '' },
]

const DESKTOP_COLUMNS = 3

export default function Projects() {
  const isMobile = useIsMobile()
  const [showAll, setShowAll] = useState(false)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetchPublicContent()
      .then((data) => {
        if (!alive) return
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects)
        } else {
          setProjects(fallbackProjects)
        }
        setLoading(false)
      })
      .catch(() => {
        if (!alive) return
        setProjects(fallbackProjects)
        setLoading(false)
      })
    return () => { alive = false }
  }, [])

  const visibleProjectsCount = isMobile ? 3 : DESKTOP_COLUMNS
  const hasMoreProjects = projects.length > visibleProjectsCount
  const displayedProjects = showAll ? projects : projects.slice(0, visibleProjectsCount)

  return (
    <section id="projects" className="px-5 py-10 sm:px-10 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="border-b border-line pb-6">
          <h2 className="font-display text-2xl text-bone sm:text-3xl">Selected Projects</h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: visibleProjectsCount }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] rounded-xl bg-panel" />
                  <div className="mt-4 flex items-start gap-3">
                    <div className="h-4 w-5 shrink-0 rounded bg-panel" />
                    <div className="flex-1 space-y-2 pt-0.5">
                      <div className="h-3.5 w-2/3 rounded bg-panel" />
                      <div className="h-2.5 w-1/3 rounded bg-panel" />
                    </div>
                  </div>
                </div>
              ))
            : displayedProjects.map((project, i) => {
            const content = (
              <>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-panel">
                  <img
                    src={apiUrl(project.image)}
                    alt={project.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="font-display text-sm text-blood">{project.number || project.id}</span>
                    <div>
                      <p className="text-sm font-semibold text-bone">{project.name}</p>
                      <p className="text-xs uppercase tracking-wide text-smoke">{project.tag}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="mt-1 shrink-0 text-smoke transition-all duration-300 group-hover:translate-x-1 group-hover:text-blood" />
                </div>
              </>
            )

            return (
              <Reveal key={project.id} delay={i * 100} as="article" className="group">
                {project.url ? (
                  <a href={project.url} target="_blank" rel="noreferrer" aria-label={`Open ${project.name}`}>
                    {content}
                  </a>
                ) : content}
              </Reveal>
            )
          })}
        </div>

        {!loading && hasMoreProjects && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className={`group flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-bone transition-all duration-300 hover:border-blood hover:text-blood ${!showAll ? 'border-blood text-blood animate-pulseGlow' : ''}`}
            >
              {showAll ? 'See Less' : 'See More'}
              <ArrowRight size={16} weight="bold" className={`transition-transform duration-300 group-hover:translate-x-1 ${!showAll ? 'translate-x-0.5' : ''} ${showAll ? 'rotate-[-90deg]' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}