# CSE3CWA Assessment 2 — Phoneme Activity Builder

A full-stack Next.js application for Speech Pathology teachers. The Assessment 1 frontend workflow is retained and Assessment 2 adds database persistence, backend APIs, CRUD operations, validation, standalone HTML generation and Docker execution.

## Assessment basis

This project is structured as a Next.js App Router application matching the required `npx create-next-app .` workflow. It implements the Assessment 2 brief while keeping the required Assessment 1 pages and frontend workflow in place.

The starter database is seeded from the supplied `HCE_Wordle_Phoneme_Corpus.docx`. The supplied corpus contains 90 HCE words grouped into 3-, 4- and 5-phoneme sets. Multi-character symbols such as `tʃ`, `dʒ`, `ɜː`, `æɪ` and `əʉ` are stored as complete phoneme units rather than split characters.

The generated Word Search follows the interaction model demonstrated by the supplied `Phoneme Word Search.html`: a phoneme-cell grid, straight-line selection, pointer/touch interaction, and optional answer display.

The supplied assessment material explicitly gives the example **/θ/ → TH (as in thin)**. The broader English teaching labels in `lib/phonemes.js` were added as interface hints to satisfy the hint/feedback requirement; they are not presented as an additional official corpus supplied by the unit and should be reviewed if your lecturer provides a preferred equivalence table.

## Main features

- Required frontend pages: Home, About, Wordle, Word Search and Settings.
- Responsive navigation plus compact hamburger/kebab-style navigation.
- Header with assessment title and footer with student details.
- Persistent light/dark theme and layout density stored in cookies.
- Prisma ORM with SQLite persistence.
- Normalised `WordList`, `Word`, `Phoneme`, `WordPhoneme` and `ActivityConfig` models.
- Ordered phoneme relationships preserve multi-character HCE symbols.
- CRUD for word lists, words and activity configurations.
- Validation and useful error responses for malformed data.
- Exact `/health` endpoint that checks database connectivity and returns HTTP 200 when healthy.
- Database-driven standalone HTML generation for both Wordle and Word Search.
- Playable generated Wordle with phoneme keyboard, hover/focus hints, positional feedback and English answer display.
- Playable generated Word Search with horizontal/vertical/diagonal/reverse options, pointer/touch selection and optional Show Answers.
- Dockerfile and Docker Compose configuration.
- No external JavaScript or CSS required by generated classroom HTML files.

## 1. Local setup

Requirements: Node.js 22+ and npm.

If starting from a fresh Next.js scaffold, the unit brief requires the project to originate from:

```bash
npx create-next-app .
```

For this supplied project folder, install dependencies and initialise the database:

```bash
npm install
npm run db:setup
npm run dev
```

Open:

```text
http://localhost:3000
```

The database setup command runs Prisma Client generation, creates the SQLite schema and seeds the supplied HCE corpus.

To reset the development database to the supplied corpus:

```bash
npm run db:reset
```

## 2. Health API

The assessment requires this exact route:

```text
GET /health
```

Browser:

```text
http://localhost:3000/health
```

Command line:

```bash
curl -i http://localhost:3000/health
```

Healthy response:

```http
HTTP/1.1 200 OK
```

```json
{"status":"ok","database":"connected","timestamp":"..."}
```

`/api/health` is also provided as an alias, but `/health` is the route to show in the assessment video.

## 3. Database design

Relationship overview:

```text
WordList 1 ───── * Word 1 ───── * WordPhoneme * ───── 1 Phoneme
    │
    └─────────── * ActivityConfig
```

### Why phonemes are normalised

A word is not stored as one unstructured phoneme string. Each `WordPhoneme` row stores its `position` and links to one `Phoneme` record. This means:

```text
choice
position 0 → tʃ
position 1 → oɪ
position 2 → s
```

`tʃ` and `oɪ` remain single phoneme units even though each contains more than one Unicode character.

### Activity settings

`ActivityConfig` stores multiple reusable configurations with fields including:

- activity type (`wordle` or `wordsearch`)
- word list
- difficulty
- word count
- phoneme length for Wordle
- maximum Wordle attempts
- grid rows/columns for Word Search
- hint settings
- diagonal/reverse placement options
- answer display option
- title and instructions for the generated HTML

## 4. API summary

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Required healthcheck; returns 200 when app/database are healthy |
| GET | `/api/word-lists` | Read word lists |
| POST | `/api/word-lists` | Create a word list |
| GET | `/api/word-lists/:id` | Read one list with its words/configurations |
| PUT | `/api/word-lists/:id` | Update a word list |
| DELETE | `/api/word-lists/:id` | Delete a word list and its dependent data |
| GET | `/api/words` | Read stored words and ordered phonemes |
| POST | `/api/words` | Create a word |
| GET | `/api/words/:id` | Read one word |
| PUT | `/api/words/:id` | Update a word and its phoneme sequence |
| DELETE | `/api/words/:id` | Delete a word |
| GET | `/api/configs` | Read activity configurations |
| POST | `/api/configs` | Create activity settings |
| GET | `/api/configs/:id` | Read one configuration |
| PUT | `/api/configs/:id` | Update activity settings |
| DELETE | `/api/configs/:id` | Delete activity settings |
| GET | `/api/phonemes` | Read phoneme inventory/hints |
| POST | `/api/generate` | Generate standalone Wordle or Word Search HTML from stored data |

### Example create-word request

```json
{
  "english": "choice",
  "phonemes": ["tʃ", "oɪ", "s"],
  "difficulty": "easy",
  "hint": "Affricate and diphthong practice",
  "listId": 1
}
```

### Example generate request

```json
{
  "configId": 1
}
```

The generator responds with `text/html` and a download filename. The generated file contains the selected database data plus embedded CSS and JavaScript, so it can be opened separately in a normal browser.

## 5. Docker

Build and run:

```bash
docker compose up --build
```

Then open:

```text
http://localhost:3000
```

Check the required health route:

```bash
curl -i http://localhost:3000/health
```

Stop the container:

```bash
docker compose down
```

The Docker build creates and seeds the SQLite database before the Next.js production build, then copies the resulting application/database into the runtime image.

## 6. Frontend workflow

1. **Word Lists** — create, read, update and delete word lists and words.
2. **Activity Settings** — create, read, update and delete reusable Wordle/Word Search configurations.
3. **Wordle** — choose a saved Wordle configuration, preview the database-generated activity and download the standalone HTML.
4. **Word Search** — choose a saved Word Search configuration, preview and download the standalone HTML.
5. **Settings** — change cookie-persisted theme/layout preferences.
6. **About** — explains project purpose, accessibility and architecture.

## 7. Suggested Git/GitHub workflow

Do **not** commit `node_modules`, `.next`, `.env` or `prisma/dev.db`. The supplied `.gitignore` excludes these. After your first successful `npm install`, keep and commit the generated `package-lock.json` so dependency installation is reproducible.

A sensible commit sequence is:

1. `chore: initialise Next.js assessment project`
2. `feat: add Prisma schema and HCE corpus seed data`
3. `feat: implement word list and word CRUD APIs`
4. `feat: implement activity configuration CRUD`
5. `feat: integrate database management frontend`
6. `feat: add standalone Wordle generator`
7. `feat: add standalone Word Search generator`
8. `feat: add validation and health endpoint`
9. `chore: add Docker support`
10. `docs: add README and video demonstration guide`

## 8. Video demonstration checklist

The Assessment 2 instructions require the video to show the student ID within the first 30 seconds, show your face and use narration throughout. A complete suggested script is in `DEMO_SCRIPT.md`.

At minimum demonstrate:

- student ID in the first 30 seconds
- frontend pages remain in place
- backend/database architecture
- create, read, update and delete a word or activity setting
- ordered multi-character phoneme data
- frontend using stored data to generate Wordle HTML
- frontend using stored data to generate Word Search HTML
- downloaded HTML opened separately in a browser
- `/health` returning HTTP 200
- application running in Docker
- GitHub repository homepage and meaningful commit history
- references used

## 9. Assessment mapping

See `REQUIREMENTS_CHECKLIST.md` for a direct mapping between the brief/rubric and project files.

## 10. References — APA 7th style

Docker, Inc. (n.d.). *Docker documentation*. https://docs.docker.com/

MDN Web Docs. (n.d.). *Fetch API*. https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

Meta Platforms, Inc. (n.d.). *React documentation*. https://react.dev/

Prisma Data, Inc. (n.d.). *Prisma ORM documentation*. https://www.prisma.io/docs/orm

Vercel. (n.d.). *Next.js documentation*. https://nextjs.org/docs

World Wide Web Consortium. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/

## 11. Submission preparation

Before creating the final submission ZIP:

1. Replace the student-detail placeholders in `lib/site.js`.
2. Run `npm install` and `npm run db:setup`.
3. Run `npm run dev` and manually test CRUD plus both generated activities.
4. Run `npm run build` successfully.
5. Run `docker compose up --build` and test the application and `/health` route.
6. Push the project to GitHub and verify commit history.
7. Complete the university AI acknowledgement.
8. Record the 6–8 minute video according to the brief.
9. Remove `node_modules` before making the uploaded ZIP.
