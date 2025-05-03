import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'SecretKey',
  resave: false,
  saveUninitialized: true
}));

function renderPage(title, body, fgColor = 'black', bgColor = 'white') {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body style="color: ${fgColor}; background-color: ${bgColor};">
      <nav>
        <a href="/counter">Counter</a> |
        <a href="/changeStyle?color=yellow&bg=green">Set yellow on Green</a>
      </nav>
      ${body}
    </body>
    </html>
  `;
}

app.get('/', (req, res) => {
  const fg = req.session.fgColor || 'black';
  const bg = req.session.bgColor || 'white';
  const content = `
    <h1>Main Page</h1>
    <p>Welcome! Your session color is <strong>${fg}</strong> on <strong>${bg}</strong>.</p>
  `;
  res.send(renderPage("Home", content, fg, bg));
});

app.get('/changeStyle', (req, res) => {
  const { color, bg } = req.query;
  if (color) req.session.fgColor = color;
  if (bg) req.session.bgColor = bg;
  res.redirect('/');
});

app.get('/counter', (req, res) => {
  if (typeof req.session.count !== 'number') {
    req.session.count = 0;
  }
  const fg = req.session.fgColor || 'black';
  const bg = req.session.bgColor || 'white';

  const content = `
    <h1>Counter</h1>
    <p>Current count: ${req.session.count}</p>
    <form action="/counter/up" method="post">
        <button>Up</button>
    </form>
    <form action="/counter/down" method="post">
        <button>Down</button>
    </form>
  `;
  res.send(renderPage("Counter", content, fg, bg));
});
app.get('/pressed', (req, res) => {
    if (a);
});
app.post('/counter/up', (req, res) => {
    req.session.count++;
    res.redirect('/counter');
});

app.post('/counter/down', (req, res) => {
    req.session.count--;
    res.redirect('/counter');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
