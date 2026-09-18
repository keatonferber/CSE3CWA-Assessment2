# API demonstration commands

Run the application first:

```bash
npm run dev
```

## Required healthcheck

```bash
curl -i http://localhost:3000/health
```

Expected: `HTTP/1.1 200 OK` and JSON containing `"status":"ok"`.

## Read word lists

```bash
curl http://localhost:3000/api/word-lists
```

## Create a temporary list

```bash
curl -X POST http://localhost:3000/api/word-lists \
  -H "Content-Type: application/json" \
  -d '{"name":"API Demo List","description":"Temporary list for CRUD demo"}'
```

Use the returned list `id` below.

## Create a word

```bash
curl -X POST http://localhost:3000/api/words \
  -H "Content-Type: application/json" \
  -d '{"english":"choice","phonemes":["tʃ","oɪ","s"],"difficulty":"easy","hint":"API demo","listId":4}'
```

Adjust `listId` to the ID returned by the previous command.

## Read words

```bash
curl http://localhost:3000/api/words
```

## Update a word

```bash
curl -X PUT http://localhost:3000/api/words/91 \
  -H "Content-Type: application/json" \
  -d '{"english":"choice","phonemes":["tʃ","oɪ","s"],"difficulty":"medium","hint":"Updated through API","listId":4}'
```

Adjust both IDs to your actual temporary records.

## Delete a word

```bash
curl -X DELETE http://localhost:3000/api/words/91
```

## Generate a saved activity

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"configId":1}' \
  -o generated-wordle.html
```

Open `generated-wordle.html` directly in a browser.

## Windows PowerShell alternative

PowerShell can use `Invoke-RestMethod`:

```powershell
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/api/words
```
