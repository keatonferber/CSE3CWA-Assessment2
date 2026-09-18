import { site } from '@/lib/site';

export default function AboutPage() {
  return (
    <section>
      <p className="eyebrow">Project context</p><h1>About the builder</h1>
      <p className="lead">This project is a teacher-facing classroom activity builder for Speech Pathology students. Assessment 1 was the frontend-only stage and established the builder workflow; Assessment 2 retains that interface and adds database persistence, backend APIs, validation and Docker execution.</p>
      <div className="grid2" style={{ marginTop: 20 }}>
        <article className="card"><h2>Wordle</h2><p className="muted">A playable phoneme Wordle uses one phoneme per cell and provides positional feedback. Saved word lists allow Assessment 2 outputs to rotate through multiple stored targets.</p></article>
        <article className="card"><h2>Word Search</h2><p className="muted">A phoneme grid is generated from a stored word list. Students select complete phoneme sequences using pointer or touch interaction.</p></article>
        <article className="card"><h2>Accessibility</h2><p className="muted">The interface uses semantic controls, visible labels, keyboard focus states, responsive layouts and phoneme teaching hints such as <strong>/θ/ — TH (as in thin)</strong>.</p></article>
        <article className="card"><h2>Technical structure</h2><p className="muted">Next.js provides the React frontend and server-side route handlers. Prisma manages SQLite persistence. The generator produces self-contained HTML, and the application includes a Docker configuration for reproducible execution.</p></article>
      </div>
      <div className="card" style={{ marginTop: 20 }}><h2>Student details</h2><p><strong>Name:</strong> {site.studentName}<br/><strong>Student number:</strong> {site.studentNumber}</p><p className="muted">Replace the two placeholders in <span className="codeLike">lib/site.js</span> before recording or submitting.</p></div>
      <div className="card" style={{ marginTop: 20 }}><h2>How to use the website</h2><ol className="steps"><li>Manage word lists and ordered phoneme sequences on <strong>Word Lists</strong>.</li><li>Create or edit reusable database-backed settings on <strong>Activity Settings</strong>.</li><li>Open <strong>Wordle</strong> or <strong>Word Search</strong> to preview the generated activity.</li><li>Select <strong>Generate HTML</strong> to download a standalone playable file.</li></ol></div>
    </section>
  );
}
