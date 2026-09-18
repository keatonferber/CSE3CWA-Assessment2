# Assessment 2 requirement mapping

This checklist maps the supplied Assessment 1/2 briefs and Assessment 2 rubric to the implementation.

| Requirement | Implementation evidence |
|---|---|
| Next.js project using create-next-app structure | `app/`, `components/`, `next.config.mjs`, `package.json` |
| Assessment 1 frontend remains | Home, About, Wordle, Word Search, Settings pages under `app/` |
| Navigation/header/footer/compact menu | `components/Nav.jsx`, `components/Footer.jsx` |
| Theme stored in cookies | `app/settings/page.js`, `app/layout.js` |
| Word lists and phonemes | Prisma `WordList`, `Word`, `Phoneme`, `WordPhoneme` models |
| Multi-character phonemes | `WordPhoneme` relates one ordered token to one `Phoneme.symbol`; seeded examples include `tʃ`, `dʒ`, `æɪ`, `əʉ` |
| Multiple activity configurations | Prisma `ActivityConfig`; CRUD UI in `/activities` |
| Difficulty/hints/output metadata | `ActivityConfig` fields in `prisma/schema.prisma` |
| Word list CRUD | `/api/word-lists`, `/api/word-lists/[id]`, `/words` UI |
| Word CRUD | `/api/words`, `/api/words/[id]`, `/words` UI |
| Activity settings CRUD | `/api/configs`, `/api/configs/[id]`, `/activities` UI |
| Validation/error handling | `lib/validation.js` and JSON error responses from API routes |
| Required health endpoint | `app/health/route.js` → `GET /health` |
| Wordle generation from stored data | `app/api/generate/route.js`, `lib/generator.js`, `/wordle` |
| Word Search generation from stored data | `app/api/generate/route.js`, `lib/generator.js`, `/word-search` |
| Standalone downloadable HTML | Generator embeds data, CSS and JavaScript into one `.html` response |
| Wordle hover/focus phoneme hints | `lib/phonemes.js`, generated keyboard titles/ARIA labels |
| Word Search pointer/touch workflow | generated Pointer Events selection in `lib/generator.js` |
| Docker execution | `Dockerfile`, `docker-compose.yml` |
| Professional GitHub practice | `.gitignore`, README commit sequence; user must create actual repository/commits |
| No node_modules in submission | `.gitignore`, `.dockerignore`, submission checklist |
| AI acknowledgement | `AI_ACKNOWLEDGEMENT.txt` template; university acknowledgement still must be completed |
| Minimum five references | README contains six official industry/standards sources in APA-style format |
