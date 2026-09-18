import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [wordCount, listCount, configCount, phonemeCount] = await Promise.all([
    prisma.word.count(),
    prisma.wordList.count(),
    prisma.activityConfig.count(),
    prisma.phoneme.count()
  ]);

  return (
    <>
      <section className="hero">
        <div className="heroCard">
          <p className="eyebrow">Speech Pathology classroom builder</p>
          <h1>Build phoneme activities from stored HCE word data.</h1>
          <p className="lead">Teachers can manage phoneme-based word lists and activity settings in the database, preview Wordle or Word Search activities, and generate a single standalone HTML file for classroom use.</p>
          <div className="actions">
            <Link className="button" href="/wordle">Build Wordle</Link>
            <Link className="button secondary" href="/word-search">Build Word Search</Link>
          </div>
        </div>
        <aside className="heroCard stats" aria-label="Database summary">
          <div className="stat"><strong>{wordCount}</strong><span className="muted">stored words</span></div>
          <div className="stat"><strong>{phonemeCount}</strong><span className="muted">phoneme symbols</span></div>
          <div className="stat"><strong>{listCount}</strong><span className="muted">word lists</span></div>
          <div className="stat"><strong>{configCount}</strong><span className="muted">saved activity configurations</span></div>
        </aside>
      </section>

      <section className="grid3" style={{ marginTop: 20 }}>
        <article className="card"><p className="eyebrow">1 · Store</p><h2>Ordered phoneme data</h2><p className="muted">Words are stored as ordered phoneme relationships, so multi-character symbols such as <strong>tʃ</strong>, <strong>dʒ</strong>, <strong>æɪ</strong> and <strong>əʉ</strong> each remain one phoneme cell.</p><Link href="/words">Manage word lists →</Link></article>
        <article className="card"><p className="eyebrow">2 · Configure</p><h2>Reusable settings</h2><p className="muted">Save multiple Wordle and Word Search configurations with difficulty, hints, word count, grid settings and generated-output preferences.</p><Link href="/activities">Manage activity settings →</Link></article>
        <article className="card"><p className="eyebrow">3 · Generate</p><h2>Standalone output</h2><p className="muted">The frontend asks the backend for saved data, then downloads a complete playable HTML document that does not require the builder to remain open.</p><Link href="/word-search">Preview an activity →</Link></article>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <p className="eyebrow">Supplied corpus</p>
        <h2>HCE phoneme notation is preserved</h2>
        <p className="muted">The starter database is seeded from the supplied HCE Wordle phoneme corpus. For example: <span className="codeLike">choice = tʃ · oɪ · s</span>, <span className="codeLike">boat = b · əʉ · t</span>, and <span className="codeLike">bird = b · ɜː · d</span>.</p>
      </section>
    </>
  );
}
