# 6–8 minute Assessment 2 video walkthrough script

Do not read this word-for-word if it sounds unnatural. Use it as a checklist so every required demonstration appears on screen.

## 0:00–0:30 — identity and project

- Keep your face visible and show your student ID within the first 30 seconds.
- Say your name, student number, subject and Assessment 2.
- Show the running Home page.
- Explain in one sentence: Assessment 1 was the frontend builder; Assessment 2 adds backend APIs, database persistence and Docker while keeping the frontend workflow.

## 0:30–1:20 — architecture/database

- Open `prisma/schema.prisma` briefly.
- Explain `WordList → Word → WordPhoneme → Phoneme`.
- Point to `position` in `WordPhoneme`.
- Explain that a symbol such as `tʃ` or `æɪ` is stored as one phoneme record, so the system does not split it into ordinary characters.
- Point out `ActivityConfig` and say it stores multiple reusable Wordle/Word Search configurations, including difficulty, hints and generated-output settings.

## 1:20–2:40 — CRUD demonstration

Open **Word Lists**.

1. CREATE: add a temporary word list such as `Video Demo List`.
2. CREATE: add a word such as `choice` with `tʃ oɪ s`.
3. READ: show it appearing in the database-backed table.
4. UPDATE: edit the hint or difficulty and save.
5. DELETE: delete the temporary word after demonstrating it.

Then briefly open **Activity Settings** and show that Wordle/Word Search configurations are stored and editable. If time permits, edit one setting and save it.

## 2:40–4:10 — Wordle database integration and output

- Open **Wordle**.
- Select a saved configuration.
- Explain that the frontend sends the configuration ID to the backend generator.
- Click **Preview**.
- Play one or two guesses to show that each cell contains one phoneme and the feedback works.
- Hover/focus `/θ/` or another phoneme to show the teaching hint.
- Click **Generate HTML**.
- Open the downloaded `.html` file separately in the browser.
- Explain that it is a single standalone file and no longer depends on the builder/server to run.

## 4:10–5:20 — Word Search database integration and output

- Open **Word Search**.
- Select the saved configuration and click **Preview**.
- Drag across a phoneme sequence to demonstrate selection.
- Show the **Show answers** feature if enabled.
- Click **Generate HTML** and open the downloaded file separately.
- Mention that its words came from the stored word list rather than hard-coded frontend values.

## 5:20–5:50 — validation/error handling

- On Word Lists, briefly try invalid input such as an empty phoneme sequence, or mention that the API rejects malformed data and displays the returned message.
- Do not spend too long deliberately breaking the demo.

## 5:50–6:15 — required health route

Open:

```text
http://localhost:3000/health
```

Show the JSON response and make it clear the HTTP response is **200 OK**. If your browser does not visibly show the status code, use:

```bash
curl -i http://localhost:3000/health
```

## 6:15–7:00 — Docker

Show the terminal command:

```bash
docker compose up --build
```

Then show the application loading from `http://localhost:3000` while the container is running. Briefly explain that the Dockerfile builds the application and includes the seeded SQLite database.

## 7:00–7:40 — GitHub, code quality and references

- Show the GitHub repository homepage.
- Show several meaningful commits rather than one final upload commit.
- Point out the README and `.gitignore` and mention that `node_modules` is excluded.
- Show the References section in the README: Next.js, React, Prisma, Docker, MDN and WCAG.
- Mention modular components, route handlers, validation module and generator module.

## 7:40–8:00 — close

Briefly summarise that the project now persists teacher data, provides CRUD APIs, generates both activities from stored content, exposes `/health`, and runs in Docker.
