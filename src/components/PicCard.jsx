const roles = [
  { label: "Full Stack Developer", pos: "r1", side: "left" },
  { label: "AI Engineer", pos: "r2", side: "right" },
  { label: "Content Creator", pos: "r3", side: "left" },
  { label: "Director of Operations", pos: "r4", side: "right" },
  { label: "Emcee", pos: "r5", side: "left" },
  { label: "Dancer", pos: "r6", side: "right" },
];

function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 60 40" fill="none">
      <path d="M5 34 C 18 4, 40 4, 54 20" />
      <path d="M43 11 L54 20 L42 26" />
    </svg>
  );
}

export default function PicCard() {
  return (
    <section className="pic-section">
      <div className="pic-card">
        <h2 className="pic-title">Hii, I'm Barath</h2>

        <img className="pic-photo" src="/images/barath.jpg" alt="Barath" />

        {roles.map((r) => (
          <div key={r.label} className={`role ${r.pos} ${r.side}`}>
            <span>{r.label}</span>
            <Arrow />
          </div>
        ))}
      </div>
    </section>
  );
}