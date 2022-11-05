const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const Database = require('@replit/database');
const { customAlphabet } = require('nanoid');
const { readFile } = require('fs').promises;
const fs = require("fs");

const db = new Database();

const alphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const size = 6;
const nanoid = customAlphabet(alphabet, size);
const idRegex = new RegExp(`^[${alphabet}]{${6}}$`);

const app = express();

app.use(morgan("dev"));
app.use(express.static(__dirname + "/public_html"));

const urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * GET /
 */
app.get('/', async (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(__dirname + "/public_html/index.html");
});

/**
 * POST /
 */
app.post('/', urlencodedParser, async (req, res) => {
  const { url } = req.body;
  res.set('Content-Type', 'text/html');

  if (!url) {
    res.sendFile(__dirname + "/public_html/index.html");
    return;
  }

  // ensure id is unique
  let id;
  while (true) {
    id = nanoid();
    if (!(await db.get(id))) {
      await db.set(id, url);
      break;
    }
  }

  const shortenedUrl = `https://${req.get('host')}/${id}`;

  const block = `
<p>
  Shortened URL:
  <a href="${shortenedUrl}" rel="noopener noreferrer" target="_blank">
    ${shortenedUrl}
  </a>
</p>
`;

  const html = readFile("public_html/index.html");
  res.send(await html + block);
});

/**
 * GET /:id
 */
app.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  if (!idRegex.test(id)) {
    return next();
  }

  const fullUrl = await db.get(id);
  if (!fullUrl) {
    return next();
  }

  res.redirect(301, fullUrl);
});

/*
// empty databse (development)
app.get('/db-empty', async (req, res, next) => {
  await db.empty();
  res.send('Database Emptied');
});
*/

/**
 * 404
 */
app.use((req, res) => {
  res.status(404).sendFile(__dirname + "/404.html");
});

/**
 * GET /index.js
 */
app.get("/index.js", (req, res, next) => {
  res.status(404).sendFile(__dirname + "/404.html");
});

/**
 * GET /server.log
 */
app.get("/server.log", (req, res, next) => {
  try {
    res.send(fs.readFileSync("./public_html/server.log"))
  } catch {
    res.status(403).sendFile(__dirname + "/403.html");
  }
});

/**
 * Error
 */
app.use((err, req, res, next) => {
  next(err);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening on port %d', port));
