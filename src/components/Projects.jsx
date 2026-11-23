import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './Projects.css'

// ---------------------------------------------------------------
// EDIT THESE
// ---------------------------------------------------------------

// Your small photo on the right (put the file in /public/images/ and paste the path here).
// Example: '/images/barath-projects.jpg'.  Leave '' to show a placeholder box.
const PROFILE_IMG = '/images/projects-barath.jpg'

const ABOUT =
  "My journey in technology revolves around Artificial Intelligence and Data Science (AIDS) at SRM Easwari Engineering College. I'm particularly interested in exploring AI engineering and full-stack development, bringing together intelligent systems and modern web technologies. I enjoy taking on technical challenges, experimenting with new ideas, and building solutions that go beyond just code."

// Your 3 projects. Replace the text, images and links.
//  page:        where the "Explore Now" button goes (the project page / live site / repo link)
//               Clicking the tile itself opens the popup instead.
//  image:       screenshot in /public/images/ (e.g. '/images/project1.jpg'), or '' for a coloured tile
//  c1 / c2:     the two colours of the tile (top colour, bottom colour)
//  description: shown in the popup
//  highlights:  bullet points shown in the popup
//  stack:       small tags shown in the popup
//  github/live: links shown in the popup ('' hides the button)
const PROJECTS = [
  {
    title: 'Project One',
    tag: 'React • Node.js • MongoDB',
    page: '',
    image: '',
    c1: '#8a2a45',
    c2: '#3a0e1d',
    description:
      'Write 2 or 3 sentences here about what this project does, the problem it solves and what you built.',
    highlights: [
      'Key feature or result number one',
      'Key feature or result number two',
      'Key feature or result number three',
    ],
    stack: ['React', 'Node.js', 'MongoDB'],
    github: '',
    live: '',
  },
  {
    title: 'Project Two',
    tag: 'Python • AI • Data Science',
    page: '',
    image: '',
    c1: '#2c7a62',
    c2: '#0f3a30',
    description:
      'Write 2 or 3 sentences here about what this project does, the problem it solves and what you built.',
    highlights: [
      'Key feature or result number one',
      'Key feature or result number two',
      'Key feature or result number three',
    ],
    stack: ['Python', 'Machine Learning', 'Pandas'],
    github: '',
    live: '',
  },
  {
    title: 'Project Three',
    tag: 'Full Stack • REST API',
    page: '',
    image: '',
    c1: '#6a35a0',
    c2: '#2d1450',
    description:
      'Write 2 or 3 sentences here about what this project does, the problem it solves and what you built.',
    highlights: [
      'Key feature or result number one',
      'Key feature or result number two',
      'Key feature or result number three',
    ],
    stack: ['React', 'Express', 'SQL'],
    github: '',
    live: '',
  },
]

// ---------------------------------------------------------------
// Popup with more details (rendered on top of the whole page)
// ---------------------------------------------------------------
function ProjectModal({ project, index, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    // Stop the page behind the popup from scrolling
    const body = document.body
    const prevOverflow = body.style.overflow
    const prevPadding = body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`

    return () => {
      window.removeEventListener('keydown', onKey)
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPadding
    }
  }, [onClose])

  return createPortal(
    <div className="pmodal-overlay" onClick={onClose}>
      <div
        className="pmodal"
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        style={{ '--c1': project.c1, '--c2': project.c2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="pmodal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div
          className="pmodal-head"
          style={
            project.image
              ? { backgroundImage: `url(${project.image})` }
              : undefined
          }
        >
          <span className="pmodal-num">{String(index + 1).padStart(2, '0')}</span>
        </div>

        <div className="pmodal-body">
          <h3 className="pmodal-title">{project.title}</h3>
          <p className="pmodal-tag">{project.tag}</p>

          <p className="pmodal-desc">{project.description}</p>

          {project.highlights?.length > 0 && (
            <ul className="pmodal-list">
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}

          {project.stack?.length > 0 && (
            <div className="pmodal-chips">
              {project.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          )}

          {(project.github || project.live) && (
            <div className="pmodal-links">
              {project.github && (
                <a
                  className="pmodal-link"
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Code
                </a>
              )}
              {project.live && (
                <a
                  className="pmodal-link alt"
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                >
                  Live Demo
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Page 2: heading + intro + photo, then the project tiles.
function Projects() {
  const [active, setActive] = useState(null) // index of the open project, or null
  const close = useCallback(() => setActive(null), [])

  return (
    <section className="projects" aria-label="My Projects">
      <div className="projects-head">
        <h2 className="projects-title">My Projects</h2>

        <p className="projects-text">{ABOUT}</p>

        <div className="projects-photo">
          {PROFILE_IMG ? (
            <img src={PROFILE_IMG} alt="Barath M" draggable="false" />
          ) : (
            <span>
              Your photo
              <br />
              goes here
            </span>
          )}
        </div>
      </div>

      <div className="projects-cards">
        {PROJECTS.map((p, i) => (
          <article
            className="pcard"
            key={p.title}
            style={{ '--c1': p.c1, '--c2': p.c2 }}
            onClick={() => setActive(i)}
          >
            {p.image && (
              <div
                className="pcard-img"
                style={{ backgroundImage: `url(${p.image})` }}
              />
            )}

            <span className="pcard-num">{String(i + 1).padStart(2, '0')}</span>

            <h3 className="pcard-title">{p.title}</h3>
            <p className="pcard-tag">{p.tag}</p>

            {/* Tile click = popup. This button = go to the project page (does not open the popup) */}
            <a
              className="pcard-btn"
              href={p.page || '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation()
                if (!p.page) e.preventDefault() // no link added yet: do nothing
              }}
            >
              <span>Explore Now</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </article>
        ))}
      </div>

      {active !== null && (
        <ProjectModal
          project={PROJECTS[active]}
          index={active}
          onClose={close}
        />
      )}
    </section>
  )
}

export default Projects