'use client';

import { useState } from 'react';
import Link from 'next/link';

function blankConfig(listId = '') {
  return {
    name: '', type: 'wordle', listId,
    difficulty: 'any', wordCount: 5, phonemeLength: 3,
    gridRows: 10, gridCols: 10, maxAttempts: 6,
    showHints: true, showEnglishOnCorrect: true,
    allowDiagonal: true, allowReverse: true, showAnswers: true,
    title: '', instructions: ''
  };
}

export default function ActivitiesClient({ initialConfigs, lists }) {
  const [configs, setConfigs] = useState(initialConfigs);
  const [form, setForm] = useState(blankConfig(lists[0]?.id ?? ''));
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function reload() {
    const response = await fetch('/api/configs', { cache: 'no-store' });
    setConfigs(await response.json());
  }

  function clearStatus() { setMessage(''); setError(''); }

  function edit(config) {
    clearStatus(); setEditingId(config.id);
    setForm({
      name: config.name, type: config.type, listId: config.listId,
      difficulty: config.difficulty, wordCount: config.wordCount,
      phonemeLength: config.phonemeLength ?? '', gridRows: config.gridRows, gridCols: config.gridCols,
      maxAttempts: config.maxAttempts, showHints: config.showHints,
      showEnglishOnCorrect: config.showEnglishOnCorrect, allowDiagonal: config.allowDiagonal,
      allowReverse: config.allowReverse, showAnswers: config.showAnswers,
      title: config.title || '', instructions: config.instructions || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit(event) {
    event.preventDefault(); clearStatus();
    const payload = {
      ...form,
      listId: Number(form.listId), wordCount: Number(form.wordCount),
      phonemeLength: form.type === 'wordle' ? Number(form.phonemeLength) : null,
      gridRows: Number(form.gridRows), gridCols: Number(form.gridCols), maxAttempts: Number(form.maxAttempts)
    };
    const response = await fetch(editingId ? `/api/configs/${editingId}` : '/api/configs', {
      method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Unable to save activity settings.');
    setMessage(editingId ? 'Activity configuration updated.' : 'Activity configuration created.');
    setEditingId(null); setForm(blankConfig(lists[0]?.id ?? ''));
    await reload();
  }

  async function remove(config) {
    clearStatus();
    if (!confirm(`Delete “${config.name}”?`)) return;
    const response = await fetch(`/api/configs/${config.id}`, { method: 'DELETE' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setError(data.error || 'Unable to delete configuration.');
    setMessage('Activity configuration deleted.');
    await reload();
  }

  return (
    <section>
      <div className="sectionHeader"><div><p className="eyebrow">Database CRUD</p><h1>Activity settings</h1><p className="lead">Create and save multiple Wordle or Word Search configurations. These settings are persisted in the database and used by the backend HTML generator.</p></div></div>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}

      <form className="card" onSubmit={submit} style={{ marginBottom: 20 }}>
        <h2>{editingId ? 'Edit configuration' : 'Create configuration'}</h2>
        {!lists.length ? <div className="notice error">Create a word list before saving an activity configuration.</div> : <div className="formGrid">
          <label>Configuration name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="3-phoneme Wordle practice" /></label>
          <label>Activity type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, phonemeLength: e.target.value === 'wordle' ? (form.phonemeLength || 3) : '' })}><option value="wordle">Wordle</option><option value="wordsearch">Word Search</option></select></label>
          <label>Word list<select value={form.listId} onChange={(e) => setForm({ ...form, listId: e.target.value })}>{lists.map((list) => <option key={list.id} value={list.id}>{list.name} ({list._count?.words ?? 0} words)</option>)}</select></label>
          <label>Difficulty<select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}><option value="any">Any</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
          <label>Words in generated activity<input type="number" min="1" max="20" required value={form.wordCount} onChange={(e) => setForm({ ...form, wordCount: e.target.value })} /></label>
          {form.type === 'wordle' && <><label>Phonemes per target<input type="number" min="1" max="10" required value={form.phonemeLength} onChange={(e) => setForm({ ...form, phonemeLength: e.target.value })} /></label><label>Maximum attempts<input type="number" min="1" max="10" required value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })} /></label></>}
          {form.type === 'wordsearch' && <><label>Grid rows<input type="number" min="4" max="20" required value={form.gridRows} onChange={(e) => setForm({ ...form, gridRows: e.target.value })} /></label><label>Grid columns<input type="number" min="4" max="20" required value={form.gridCols} onChange={(e) => setForm({ ...form, gridCols: e.target.value })} /></label></>}
          <label className="full">Generated page title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Optional custom title" /></label>
          <label className="full">Activity instructions<textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Instructions shown in the standalone HTML activity" /></label>
          <fieldset className="fieldset full"><legend>Output settings</legend><div className="grid3">
            <label className="checkRow"><input type="checkbox" checked={form.showHints} onChange={(e) => setForm({ ...form, showHints: e.target.checked })} /> Phoneme hover/focus hints</label>
            {form.type === 'wordle' ? <label className="checkRow"><input type="checkbox" checked={form.showEnglishOnCorrect} onChange={(e) => setForm({ ...form, showEnglishOnCorrect: e.target.checked })} /> Show English word when correct</label> : <>
              <label className="checkRow"><input type="checkbox" checked={form.allowDiagonal} onChange={(e) => setForm({ ...form, allowDiagonal: e.target.checked })} /> Allow diagonal words</label>
              <label className="checkRow"><input type="checkbox" checked={form.allowReverse} onChange={(e) => setForm({ ...form, allowReverse: e.target.checked })} /> Allow reverse words</label>
              <label className="checkRow"><input type="checkbox" checked={form.showAnswers} onChange={(e) => setForm({ ...form, showAnswers: e.target.checked })} /> Include Show Answers button</label>
            </>}
          </div></fieldset>
        </div>}
        <div className="actions"><button className="button" type="submit" disabled={!lists.length}>{editingId ? 'Save changes' : 'Create configuration'}</button>{editingId && <button className="button secondary" type="button" onClick={() => { setEditingId(null); setForm(blankConfig(lists[0]?.id ?? '')); }}>Cancel</button>}</div>
      </form>

      <div className="tableWrap"><table><thead><tr><th>Name</th><th>Type</th><th>Word list</th><th>Key settings</th><th>Preview</th><th>Actions</th></tr></thead><tbody>{configs.map((config) => <tr key={config.id}><td><strong>{config.name}</strong></td><td><span className="badge">{config.type === 'wordsearch' ? 'Word Search' : 'Wordle'}</span></td><td>{config.list.name}</td><td>{config.type === 'wordle' ? `${config.phonemeLength} phonemes · ${config.maxAttempts} attempts · ${config.wordCount} targets` : `${config.gridRows}×${config.gridCols} · ${config.wordCount} words`}</td><td><Link href={config.type === 'wordle' ? '/wordle' : '/word-search'}>Open builder</Link></td><td><div className="toolbar"><button className="button secondary small" type="button" onClick={() => edit(config)}>Edit</button><button className="button danger small" type="button" onClick={() => remove(config)}>Delete</button></div></td></tr>)}</tbody></table></div>
    </section>
  );
}
