'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export default function ActivityBuilderClient({ type, configs }) {
  const [configId, setConfigId] = useState(configs[0]?.id ?? '');
  const [srcDoc, setSrcDoc] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const selected = useMemo(() => configs.find((config) => config.id === Number(configId)), [configs, configId]);

  async function getHtml() {
    if (!configId) throw new Error(`Create a saved ${type === 'wordle' ? 'Wordle' : 'Word Search'} configuration first.`);
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configId: Number(configId) })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'The activity could not be generated.');
    }
    return { html: await response.text(), disposition: response.headers.get('Content-Disposition') || '' };
  }

  async function preview() {
    setBusy(true); setError(''); setMessage('');
    try {
      const { html } = await getHtml();
      setSrcDoc(html);
      setMessage('Preview generated from stored database data.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    setBusy(true); setError(''); setMessage('');
    try {
      const { html, disposition } = await getHtml();
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const filename = match?.[1] || `${type}-activity.html`;
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(`Downloaded ${filename}. Open it directly in a normal web browser.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!configs.length) {
    return <div className="card"><h2>No saved configurations yet</h2><p className="muted">Create a database-backed activity configuration before generating an output.</p><Link className="button" href="/activities">Create activity settings</Link></div>;
  }

  return (
    <div className="splitLayout">
      <aside className="card sidebarCard">
        <h2>Builder settings</h2>
        <label>Saved configuration
          <select value={configId} onChange={(e) => { setConfigId(e.target.value); setSrcDoc(''); setMessage(''); setError(''); }}>
            {configs.map((config) => <option key={config.id} value={config.id}>{config.name}</option>)}
          </select>
        </label>
        {selected && <div style={{ marginTop: 16 }}>
          <dl className="settingsList">
            <div><dt>Word list</dt><dd>{selected.list.name}</dd></div>
            <div><dt>Difficulty</dt><dd>{selected.difficulty}</dd></div>
            <div><dt>Words used</dt><dd>{selected.wordCount}</dd></div>
            {type === 'wordle' ? <>
              <div><dt>Phonemes per word</dt><dd>{selected.phonemeLength}</dd></div>
              <div><dt>Attempts</dt><dd>{selected.maxAttempts}</dd></div>
            </> : <>
              <div><dt>Grid</dt><dd>{selected.gridRows} × {selected.gridCols}</dd></div>
              <div><dt>Diagonal/reverse</dt><dd>{selected.allowDiagonal ? 'Diagonal ' : ''}{selected.allowReverse ? 'Reverse' : ''}</dd></div>
            </>}
          </dl>
        </div>}
        <div className="actions">
          <button className="button" type="button" onClick={preview} disabled={busy}>{busy ? 'Working…' : 'Preview'}</button>
          <button className="button secondary" type="button" onClick={download} disabled={busy}>Generate HTML</button>
          <Link className="button secondary" href="/activities">Edit settings</Link>
        </div>
        {message && <div className="notice">{message}</div>}
        {error && <div className="notice error">{error}</div>}
        <p className="fieldHelp" style={{ marginTop: 14 }}>Preview and download both call the backend generator. The resulting HTML contains its own CSS, JavaScript and activity data, so the downloaded file works without this builder.</p>
      </aside>
      <section>
        {srcDoc ? <iframe className="previewFrame" title={`${type} generated activity preview`} srcDoc={srcDoc} sandbox="allow-scripts" /> : <div className="previewEmpty"><div><h2>Preview area</h2><p>Select a stored configuration and choose <strong>Preview</strong>. The backend will retrieve words and phonemes from the database and build the activity here.</p></div></div>}
      </section>
    </div>
  );
}
