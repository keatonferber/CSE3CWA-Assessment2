import { PHONEME_KEYBOARD, hintForPhoneme } from './phonemes';
import { plainWord } from './word-data';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeJson(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

function commonStyles() {
  return `
:root{color-scheme:light;--bg:#f4f7fb;--panel:#fff;--text:#172033;--muted:#5f6b7a;--border:#cfd8e6;--accent:#2b5c8f;--accent2:#1f4770;--good:#a7f3d0;--present:#fde68a;--absent:#d8dee8;--focus:#0f6cbd}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.45}
main{width:min(100% - 32px,980px);margin:0 auto;padding:28px 0 48px}.card{background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:20px;box-shadow:0 10px 30px rgb(23 32 51 / .07)}
h1{font-size:clamp(1.8rem,4vw,2.6rem);line-height:1.1;margin:0 0 8px}.subtitle{margin:0;color:var(--muted)}button{font:inherit}button:focus-visible,.cell:focus-visible{outline:3px solid var(--focus);outline-offset:2px}.status{min-height:1.5em;font-weight:700;margin:14px 0}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.phoneme{font-family:"Arial Unicode MS","Noto Sans",system-ui,sans-serif}.toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.button{border:0;border-radius:10px;padding:10px 15px;background:var(--accent);color:white;font-weight:700;cursor:pointer}.button:hover{background:var(--accent2)}.button.secondary{background:#64748b}.button[disabled]{opacity:.5;cursor:not-allowed}
@media(max-width:600px){main{width:min(100% - 20px,980px);padding-top:14px}.card{padding:14px}}
`;
}

function shell(title, body, script) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${commonStyles()}</style>
</head>
<body>
<main>${body}</main>
<script>${script}</script>
</body>
</html>`;
}

function keyboardForWords(words) {
  const used = new Set(words.flatMap((word) => word.phonemes.map((token) => token.phoneme.symbol)));
  const ordered = PHONEME_KEYBOARD.filter((symbol) => used.has(symbol) || symbol !== 'ɡ');
  for (const symbol of used) if (!ordered.includes(symbol)) ordered.push(symbol);
  return ordered;
}

export function generateWordleHtml(config, rawWords) {
  const words = rawWords.map(plainWord);
  const title = config.title || config.name || 'Phoneme Wordle';
  const keyboard = keyboardForWords(rawWords).map((symbol) => ({ symbol, hint: hintForPhoneme(symbol) }));
  const data = {
    title,
    instructions: config.instructions || 'Build each target word using one phoneme per cell. Green means correct position; yellow means the phoneme is present in another position.',
    maxAttempts: config.maxAttempts,
    showHints: config.showHints,
    showEnglishOnCorrect: config.showEnglishOnCorrect,
    words,
    keyboard
  };

  const body = `<section class="card">
    <h1>${escapeHtml(title)}</h1>
    <p class="subtitle">${escapeHtml(data.instructions)}</p>
    <p id="progress" class="subtitle" style="margin-top:8px"></p>
    <div id="status" class="status" role="status" aria-live="polite"></div>
    <div id="grid" class="wordle-grid" aria-label="Wordle game grid"></div>
    <div class="toolbar" style="justify-content:center;margin:14px 0">
      <button id="backspace" class="button secondary" type="button">Backspace</button>
      <button id="submit" class="button" type="button">Submit guess</button>
      <button id="next" class="button" type="button" hidden>Next word</button>
    </div>
    <div id="keyboard" class="keyboard" aria-label="Phoneme keyboard"></div>
    <p class="subtitle" style="margin-top:14px">Tip: ${config.showHints ? 'hover or focus a phoneme button to see its teaching hint.' : 'phoneme hints are disabled for this activity.'}</p>
  </section>
  <style>
  .wordle-grid{display:grid;gap:7px;justify-content:center;margin:20px auto;overflow:auto}.guess-row{display:grid;gap:7px;grid-template-columns:repeat(var(--cols),minmax(48px,64px))}.cell{height:58px;border:2px solid var(--border);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:800;background:white}.cell.filled{border-color:#7b8798}.cell.exact{background:var(--good);border-color:#34d399}.cell.present{background:var(--present);border-color:#f59e0b}.cell.absent{background:var(--absent);border-color:#94a3b8}.keyboard{display:flex;flex-wrap:wrap;gap:7px;justify-content:center}.key{min-width:46px;min-height:42px;border:1px solid var(--border);border-radius:8px;background:white;color:var(--text);font-weight:800;cursor:pointer;padding:6px 10px}.key:hover{border-color:var(--accent)}
  </style>`;

  const script = `
const DATA=${safeJson(data)};
let targetIndex=0;
let attempt=0;
let guess=[];
let locked=false;
const grid=document.getElementById('grid');
const keyboard=document.getElementById('keyboard');
const statusEl=document.getElementById('status');
const progressEl=document.getElementById('progress');
const nextBtn=document.getElementById('next');
const submitBtn=document.getElementById('submit');
const backspaceBtn=document.getElementById('backspace');

function current(){return DATA.words[targetIndex]}
function targetSymbols(){return current().phonemes.map(p=>p.symbol)}
function hintFor(symbol){const item=DATA.keyboard.find(k=>k.symbol===symbol);return item?item.hint:'/'+symbol+'/'}
function setStatus(text){statusEl.textContent=text}
function renderGrid(){
  const cols=targetSymbols().length;
  grid.innerHTML='';
  grid.style.setProperty('--cols',cols);
  for(let r=0;r<DATA.maxAttempts;r++){
    const row=document.createElement('div');row.className='guess-row';row.style.setProperty('--cols',cols);row.dataset.row=r;
    for(let c=0;c<cols;c++){
      const cell=document.createElement('div');cell.className='cell phoneme';cell.dataset.col=c;cell.setAttribute('aria-label','Attempt '+(r+1)+' cell '+(c+1));row.appendChild(cell);
    }
    grid.appendChild(row);
  }
  paintGuess();
}
function renderKeyboard(){
  keyboard.innerHTML='';
  DATA.keyboard.forEach(item=>{
    const b=document.createElement('button');b.type='button';b.className='key phoneme';b.textContent=item.symbol;
    if(DATA.showHints){b.title='/'+item.symbol+'/ — '+item.hint;b.setAttribute('aria-label','/'+item.symbol+'/ '+item.hint)}
    else b.setAttribute('aria-label','phoneme '+item.symbol);
    b.addEventListener('click',()=>add(item.symbol));keyboard.appendChild(b);
  });
}
function paintGuess(){
  const row=grid.querySelector('[data-row="'+attempt+'"]');if(!row)return;
  [...row.children].forEach((cell,i)=>{cell.textContent=guess[i]||'';cell.classList.toggle('filled',Boolean(guess[i]))});
}
function add(symbol){if(locked)return;const max=targetSymbols().length;if(guess.length>=max)return;guess.push(symbol);paintGuess()}
function backspace(){if(locked||guess.length===0)return;guess.pop();paintGuess()}
function scoreGuess(input,target){
  const result=new Array(target.length).fill('absent');const remaining=new Map();
  target.forEach((token,i)=>{if(input[i]===token)result[i]='exact';else remaining.set(token,(remaining.get(token)||0)+1)});
  input.forEach((token,i)=>{if(result[i]==='exact')return;const count=remaining.get(token)||0;if(count>0){result[i]='present';remaining.set(token,count-1)}});
  return result;
}
function submit(){
  if(locked)return;const target=targetSymbols();if(guess.length!==target.length){setStatus('Choose '+target.length+' phonemes before submitting.');return}
  const result=scoreGuess(guess,target);const row=grid.querySelector('[data-row="'+attempt+'"]');
  [...row.children].forEach((cell,i)=>{cell.classList.remove('filled');cell.classList.add(result[i]);cell.title=DATA.showHints?hintFor(guess[i]):''});
  const solved=result.every(v=>v==='exact');attempt++;
  if(solved){finish(true);return}
  if(attempt>=DATA.maxAttempts){finish(false);return}
  guess=[];setStatus('Try again.');paintGuess();
}
function finish(solved){
  locked=true;submitBtn.disabled=true;backspaceBtn.disabled=true;
  const word=current();const seq=word.phonemes.map(p=>p.symbol).join(' · ');
  if(solved){setStatus(DATA.showEnglishOnCorrect?'Correct — '+word.english+' = '+seq:'Correct!')}
  else{setStatus('Finished — '+word.english+' = '+seq)}
  if(targetIndex<DATA.words.length-1)nextBtn.hidden=false;
}
function startWord(){
  attempt=0;guess=[];locked=false;nextBtn.hidden=true;submitBtn.disabled=false;backspaceBtn.disabled=false;
  progressEl.textContent='Word '+(targetIndex+1)+' of '+DATA.words.length+' · '+targetSymbols().length+' phonemes';
  setStatus('Build the phoneme word.');renderGrid();
}
function nextWord(){if(targetIndex>=DATA.words.length-1)return;targetIndex++;startWord()}
backspaceBtn.addEventListener('click',backspace);submitBtn.addEventListener('click',submit);nextBtn.addEventListener('click',nextWord);
document.addEventListener('keydown',e=>{if(e.key==='Backspace'){e.preventDefault();backspace()}if(e.key==='Enter'){e.preventDefault();submit()}});
renderKeyboard();startWord();
`;
  return shell(title, body, script);
}

export function generateWordSearchHtml(config, rawWords) {
  const words = rawWords.map(plainWord);
  const title = config.title || config.name || 'Phoneme Word Search';
  const hintMap = Object.fromEntries(PHONEME_KEYBOARD.map((symbol) => [symbol, hintForPhoneme(symbol)]));
  for (const word of words) for (const token of word.phonemes) hintMap[token.symbol] = token.hintLabel || hintForPhoneme(token.symbol);
  const data = {
    title,
    instructions: config.instructions || 'Find each phoneme sequence by dragging in a straight line through the grid.',
    rows: config.gridRows,
    cols: config.gridCols,
    allowDiagonal: config.allowDiagonal,
    allowReverse: config.allowReverse,
    showHints: config.showHints,
    showAnswers: config.showAnswers,
    words,
    hintMap
  };

  const body = `<section class="card">
    <h1>${escapeHtml(title)}</h1>
    <p class="subtitle">${escapeHtml(data.instructions)}</p>
    <div id="error" class="status" role="alert"></div>
    <div class="search-layout">
      <div>
        <div id="wordsearch" class="wordsearch-grid" aria-label="Phoneme word search grid"></div>
        <div class="toolbar" style="justify-content:center;margin-top:12px">
          ${config.showAnswers ? '<button id="answers" class="button secondary" type="button">Show answers</button>' : ''}
          <button id="newPuzzle" class="button" type="button">New layout</button>
        </div>
      </div>
      <aside>
        <h2>Find these words</h2>
        <div id="wordList" class="word-list"></div>
        <p class="subtitle" style="margin-top:12px">${config.showHints ? 'Hover or focus a cell for its phoneme hint.' : 'Phoneme hints are disabled for this activity.'}</p>
      </aside>
    </div>
  </section>
  <style>
  .search-layout{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:20px;align-items:start;margin-top:20px}.wordsearch-grid{display:grid;gap:3px;justify-content:center;touch-action:none;user-select:none;overflow:auto;padding:4px}.ws-cell{width:clamp(34px,7vw,48px);aspect-ratio:1;border:1px solid var(--border);background:white;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.05rem;cursor:pointer}.ws-cell.highlight{background:#dbeafe;border-color:#60a5fa}.ws-cell.found{background:var(--good);border-color:#34d399}.ws-cell.answer{box-shadow:inset 0 0 0 3px #e879f9}.word-list{display:grid;gap:8px}.word-item{padding:9px;border:1px solid var(--border);border-radius:9px;background:#f8fafc}.word-item.found{text-decoration:line-through;opacity:.65;background:#ecfdf5}.phoneme-seq{font-weight:800}.english{color:var(--muted);font-size:.92rem}@media(max-width:760px){.search-layout{grid-template-columns:1fr}.ws-cell{width:clamp(30px,9vw,44px)}}
  </style>`;

  const script = `
const DATA=${safeJson(data)};
const gridEl=document.getElementById('wordsearch');
const listEl=document.getElementById('wordList');
const errorEl=document.getElementById('error');
let matrix=[];let solutions=[];let selecting=false;let startCell=null;let highlighted=[];let showingAnswers=false;
const directions=DATA.allowDiagonal?[[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]:[[0,1],[1,0],[0,-1],[-1,0]];
function tokens(word){return word.phonemes.map(p=>p.symbol)}
function pool(){const p=[...new Set(DATA.words.flatMap(tokens))];return p.length?p:['ə']}
function blankGrid(){return Array.from({length:DATA.rows},()=>Array(DATA.cols).fill(null))}
function canPlace(seq,r,c,dr,dc){const er=r+dr*(seq.length-1),ec=c+dc*(seq.length-1);if(er<0||er>=DATA.rows||ec<0||ec>=DATA.cols)return false;for(let i=0;i<seq.length;i++){const cur=matrix[r+dr*i][c+dc*i];if(cur&&cur!==seq[i])return false}return true}
function placeAll(){
  matrix=blankGrid();solutions=[];const sorted=[...DATA.words].sort((a,b)=>tokens(b).length-tokens(a).length);
  for(const word of sorted){let placed=false;for(let attempt=0;attempt<400&&!placed;attempt++){
    let [dr,dc]=directions[Math.floor(Math.random()*directions.length)];if(!DATA.allowReverse&&(dr<0||dc<0)){dr=Math.abs(dr);dc=Math.abs(dc);if(dr===0&&dc===0)dc=1}
    const r=Math.floor(Math.random()*DATA.rows),c=Math.floor(Math.random()*DATA.cols),seq=tokens(word);
    if(canPlace(seq,r,c,dr,dc)){const coords=[];seq.forEach((token,i)=>{const rr=r+dr*i,cc=c+dc*i;matrix[rr][cc]=token;coords.push([rr,cc])});solutions.push({id:word.id,coords,found:false});placed=true}
  }if(!placed)return false}
  const p=pool();for(let r=0;r<DATA.rows;r++)for(let c=0;c<DATA.cols;c++)if(!matrix[r][c])matrix[r][c]=p[Math.floor(Math.random()*p.length)];return true
}
function render(){
  errorEl.textContent='';gridEl.innerHTML='';gridEl.style.gridTemplateColumns='repeat('+DATA.cols+',max-content)';
  for(let r=0;r<DATA.rows;r++)for(let c=0;c<DATA.cols;c++){const cell=document.createElement('button');cell.type='button';cell.className='ws-cell phoneme';cell.dataset.r=r;cell.dataset.c=c;cell.textContent=matrix[r][c];if(DATA.showHints){cell.title='/'+matrix[r][c]+'/ — '+(DATA.hintMap[matrix[r][c]]||'');cell.setAttribute('aria-label',cell.title)}gridEl.appendChild(cell)}
  listEl.innerHTML='';DATA.words.forEach(word=>{const item=document.createElement('div');item.className='word-item';item.id='word-'+word.id;const seq=document.createElement('div');seq.className='phoneme-seq phoneme';seq.textContent=tokens(word).join(' · ');const english=document.createElement('div');english.className='english';english.textContent=word.english;item.append(seq,english);listEl.appendChild(item)});
}
function getCell(r,c){return gridEl.querySelector('[data-r="'+r+'"][data-c="'+c+'"]')}
function clearHighlight(){highlighted.forEach(x=>x.classList.remove('highlight'));highlighted=[]}
function pathBetween(a,b){const r1=+a.dataset.r,c1=+a.dataset.c,r2=+b.dataset.r,c2=+b.dataset.c,dr=r2-r1,dc=c2-c1;if(!(dr===0||dc===0||Math.abs(dr)===Math.abs(dc)))return null;if(!DATA.allowDiagonal&&dr!==0&&dc!==0)return null;const steps=Math.max(Math.abs(dr),Math.abs(dc));const sr=steps?dr/steps:0,sc=steps?dc/steps:0;if(!Number.isInteger(sr)||!Number.isInteger(sc))return null;const path=[];for(let i=0;i<=steps;i++)path.push([r1+sr*i,c1+sc*i]);return path}
function showPath(end){clearHighlight();const path=pathBetween(startCell,end);if(!path)return;for(const [r,c] of path){const cell=getCell(r,c);if(cell){cell.classList.add('highlight');highlighted.push(cell)}}}
function matchSolution(path){const same=(a,b)=>a.length===b.length&&a.every((p,i)=>p[0]===b[i][0]&&p[1]===b[i][1]);return solutions.find(s=>!s.found&&(same(path,s.coords)||(DATA.allowReverse&&same(path,[...s.coords].reverse()))))}
function finishSelection(end){const path=pathBetween(startCell,end);if(path){const found=matchSolution(path);if(found){found.found=true;found.coords.forEach(([r,c])=>getCell(r,c).classList.add('found'));const item=document.getElementById('word-'+found.id);if(item)item.classList.add('found');if(solutions.every(s=>s.found))errorEl.textContent='Great work — all words found!'}}clearHighlight()}
function cellFromPoint(x,y){const el=document.elementFromPoint(x,y);return el&&el.classList.contains('ws-cell')?el:null}
gridEl.addEventListener('pointerdown',e=>{const cell=e.target.closest('.ws-cell');if(!cell)return;selecting=true;startCell=cell;gridEl.setPointerCapture?.(e.pointerId);showPath(cell)});
gridEl.addEventListener('pointermove',e=>{if(!selecting)return;const cell=cellFromPoint(e.clientX,e.clientY);if(cell)showPath(cell)});
gridEl.addEventListener('pointerup',e=>{if(!selecting)return;selecting=false;const cell=cellFromPoint(e.clientX,e.clientY)||startCell;finishSelection(cell)});
gridEl.addEventListener('pointercancel',()=>{selecting=false;clearHighlight()});
function toggleAnswers(){showingAnswers=!showingAnswers;solutions.forEach(s=>s.coords.forEach(([r,c])=>getCell(r,c).classList.toggle('answer',showingAnswers)));const b=document.getElementById('answers');if(b)b.textContent=showingAnswers?'Hide answers':'Show answers'}
function build(){showingAnswers=false;const ok=placeAll();if(!ok){errorEl.textContent='A word could not fit in this grid. Try New layout or use a larger grid.';return}render()}
const answerBtn=document.getElementById('answers');if(answerBtn)answerBtn.addEventListener('click',toggleAnswers);document.getElementById('newPuzzle').addEventListener('click',build);build();
`;

  return shell(title, body, script);
}

export function activityFilename(config) {
  const base = (config.name || config.type || 'activity').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'activity';
  return `${base}.html`;
}
