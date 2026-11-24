import './MoreAbout.css'

// ---------------------------------------------------------------
// EDIT THESE (page 3: "More about Me")
// ---------------------------------------------------------------

const INTRO =
  'Write a few lines about yourself here: who you are beyond the code, what drives you, and what you want to build next.'

const ROLES = [
  'Full Stack Developer',
  'AI Engineer',
  'Content Creator',
  'Director of Operations',
  'Emcee',
  'Dancer',
]

const BEYOND =
  'Write about your hobbies, your stage and dance side, the events you host, or anything else you want people to know.'

function MoreAbout() {
  return (
    <section className="more" aria-label="More about me">
      <h2 className="more-title">
        More about <span>me</span>
      </h2>

      <p className="more-text">{INTRO}</p>

      <div className="more-grid">
        <article className="more-card">
          <h3>Education</h3>
          <p className="more-big">B.Tech., Artificial Intelligence and Data Science</p>
          <p>SRM Easwari Engineering College</p>
        </article>

        <article className="more-card">
          <h3>What I do</h3>
          <div className="more-chips">
            {ROLES.map((r) => (
              <span key={r}>{r}</span>
            ))}
          </div>
        </article>

        <article className="more-card">
          <h3>Beyond the code</h3>
          <p>{BEYOND}</p>
        </article>
      </div>
    </section>
  )
}

export default MoreAbout