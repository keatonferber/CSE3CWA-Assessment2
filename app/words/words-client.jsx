'use client';

import { useMemo, useState } from 'react';

const blankList = { name: '', description: '' };
const blankWord = (listId = '') => ({ english: '', phonemes: '', difficulty: 'medium', hint: '', listId });

function phonemeText(word) {
  return word.phonemes.map((token) => token.phoneme.symbol).join(' ');
}

export default function WordsClient({ initialLists, initialWords }) {
  const [lists, setLists] = useState(initialLists);
  const [words, setWords] = useState(initialWords);
  const [selectedListId, setSelectedListId] = useState(initialLists[0]?.id ?? '');
  const [listForm, setListForm] = useState(blankList);
  const [wordForm, setWordForm] = useState(blankWord(initialLists[0]?.id ?? ''));
  const [editingListId, setEditingListId] = useState(null);
  const [editingWordId, setEditingWordId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedList = useMemo(() => lists.find((list) => list.id === Number(selectedListId)), [lists, selectedListId]);
  const visibleWords = useMemo(() => words.filter((word) => word.listId === Number(selectedListId)), [words, selectedListId]);

  async function reload(preferredListId = selectedListId) {
    const [listResponse, wordResponse] = await Promise.all([
      fetch('/api/word-lists', { cache: 'no-store' }),
      fetch('/api/words', { cache: 'no-store' })
    ]);
    const [nextLists, nextWords] = await Promise.all([listResponse.json(), wordResponse.json()]);
    setLists(nextLists); setWords(nextWords);
    const nextId = nextLists.some((list) => list.id === Number(preferredListId)) ? Number(preferredListId) : nextLists[0]?.id ?? '';
    setSelectedListId(nextId);
    setWordForm((current) => ({ ...current, listId: nextId }));
  }

  function clearStatus() { setMessage(''); setError(''); }

  async function saveList(event) {
    event.preventDefault(); clearStatus();
    const url = editingListId ? `/api/word-lists/${editingListId}` : '/api/word-lists';
    const response = await fetch(url, { method: editingListId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(listForm) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Unable to save word list.');
    const targetId = editingListId || data.id;
    setMessage(editingListId ? 'Word list updated.' : 'Word list created.');
    setEditingListId(null); setListForm(blankList);
    await reload(targetId);
  }

  function editList(list) {
    clearStatus(); setEditingListId(list.id); setListForm({ name: list.name, description: list.description || '' });
  }

  async function deleteList(list) {
    clearStatus();
    if (!confirm(`Delete “${list.name}”? Its words and saved activity configurations will also be deleted.`)) return;
    const response = await fetch(`/api/word-lists/${list.id}`, { method: 'DELETE' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setError(data.error || 'Unable to delete word list.');
    setMessage('Word list deleted.');
    setEditingListId(null); setListForm(blankList); setEditingWordId(null);
    await reload('');
  }

  async function saveWord(event) {
    event.preventDefault(); clearStatus();
    const payload = { ...wordForm, listId: Number(wordForm.listId), phonemes: wordForm.phonemes };
    const url = editingWordId ? `/api/words/${editingWordId}` : '/api/words';
    const response = await fetch(url, { method: editingWordId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Unable to save word.');
    setMessage(editingWordId ? 'Word updated.' : 'Word created.');
    setEditingWordId(null); setWordForm(blankWord(data.listId || selectedListId));
    await reload(data.listId || selectedListId);
  }

  function editWord(word) {
    clearStatus(); setEditingWordId(word.id); setSelectedListId(word.listId);
    setWordForm({ english: word.english, phonemes: phonemeText(word), difficulty: word.difficulty, hint: word.hint || '', listId: word.listId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteWord(word) {
    clearStatus();
    if (!confirm(`Delete “${word.english}”?`)) return;
    const response = await fetch(`/api/words/${word.id}`, { method: 'DELETE' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setError(data.error || 'Unable to delete word.');
    setMessage('Word deleted.');
    await reload(selectedListId);
  }

  return (
    <section>
      <div className="sectionHeader"><div><p className="eyebrow">Database CRUD</p><h1>Word lists & phonemes</h1><p className="lead">Manage teacher-created lists and their ordered phoneme data. Enter one phoneme unit at a time separated by spaces, so a multi-character symbol such as <strong>tʃ</strong> remains one database token.</p></div></div>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}

      <div className="grid2" style={{ marginBottom: 20 }}>
        <form className="card" onSubmit={saveList}>
          <h2>{editingListId ? 'Edit word list' : 'Create word list'}</h2>
          <div className="formGrid">
            <label className="full">List name<input required value={listForm.name} onChange={(e) => setListForm({ ...listForm, name: e.target.value })} placeholder="e.g. Classroom consonant practice" /></label>
            <label className="full">Description<textarea value={listForm.description} onChange={(e) => setListForm({ ...listForm, description: e.target.value })} placeholder="Purpose of this list" /></label>
          </div>
          <div className="actions"><button className="button" type="submit">{editingListId ? 'Save list' : 'Create list'}</button>{editingListId && <button className="button secondary" type="button" onClick={() => { setEditingListId(null); setListForm(blankList); }}>Cancel</button>}</div>
        </form>

        <form className="card" onSubmit={saveWord}>
          <h2>{editingWordId ? 'Edit word' : 'Add word'}</h2>
          {!lists.length ? <p className="notice error">Create a word list before adding words.</p> : <div className="formGrid">
            <label>English word<input required value={wordForm.english} onChange={(e) => setWordForm({ ...wordForm, english: e.target.value })} placeholder="choice" /></label>
            <label>Difficulty<select value={wordForm.difficulty} onChange={(e) => setWordForm({ ...wordForm, difficulty: e.target.value })}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
            <label className="full">Ordered phonemes<input required value={wordForm.phonemes} onChange={(e) => setWordForm({ ...wordForm, phonemes: e.target.value })} placeholder="tʃ oɪ s" /><span className="fieldHelp">Space-separated phoneme units. Example: <strong>choice = tʃ oɪ s</strong>.</span></label>
            <label>Word list<select value={wordForm.listId} onChange={(e) => { setWordForm({ ...wordForm, listId: e.target.value }); setSelectedListId(e.target.value); }}>{lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select></label>
            <label>Teacher hint<input value={wordForm.hint} onChange={(e) => setWordForm({ ...wordForm, hint: e.target.value })} placeholder="Optional note" /></label>
          </div>}
          <div className="actions"><button className="button" type="submit" disabled={!lists.length}>{editingWordId ? 'Save word' : 'Add word'}</button>{editingWordId && <button className="button secondary" type="button" onClick={() => { setEditingWordId(null); setWordForm(blankWord(selectedListId)); }}>Cancel</button>}</div>
        </form>
      </div>

      <div className="sourceNote" style={{ marginBottom: 20 }}><strong>Starter data:</strong> the seed script loads all 90 supplied HCE corpus words into separate 3-, 4- and 5-phoneme lists. The CRUD controls above let a teacher create additional lists and words.</div>

      <div className="splitLayout">
        <aside className="card sidebarCard">
          <h2>Stored word lists</h2>
          <div className="listButtons">{lists.map((list) => <button key={list.id} className={`listButton ${list.id === Number(selectedListId) ? 'active' : ''}`} type="button" onClick={() => { setSelectedListId(list.id); setWordForm((current) => ({ ...current, listId: list.id })); }}><strong>{list.name}</strong><small>{list._count?.words ?? 0} words · {list._count?.configs ?? 0} configs</small></button>)}</div>
          {selectedList && <div className="actions"><button className="button secondary small" type="button" onClick={() => editList(selectedList)}>Edit list</button><button className="button danger small" type="button" onClick={() => deleteList(selectedList)}>Delete list</button></div>}
        </aside>

        <div>
          <h2>{selectedList?.name || 'No list selected'}</h2>
          <p className="muted">{selectedList?.description}</p>
          <div className="tableWrap"><table><thead><tr><th>English</th><th>Ordered phonemes</th><th>Difficulty</th><th>Hint</th><th>Actions</th></tr></thead><tbody>{visibleWords.map((word) => <tr key={word.id}><td><strong>{word.english}</strong></td><td><div className="pills">{word.phonemes.map((token) => <span className="pill" key={token.id} title={token.phoneme.hintLabel}>{token.phoneme.symbol}</span>)}</div></td><td><span className="badge">{word.difficulty}</span></td><td>{word.hint || <span className="muted">—</span>}</td><td><div className="toolbar"><button className="button secondary small" type="button" onClick={() => editWord(word)}>Edit</button><button className="button danger small" type="button" onClick={() => deleteWord(word)}>Delete</button></div></td></tr>)}</tbody></table></div>
          {!visibleWords.length && <div className="previewEmpty" style={{ minHeight: 180 }}>This word list has no words yet.</div>}
        </div>
      </div>
    </section>
  );
}
