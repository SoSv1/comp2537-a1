const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const path = require('path');

const User = require('./models/user.js');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 60 * 60, // 1 hour in secs
    crypto: {
      secret: process.env.SESSION_SECRET
    }
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 // 1 hour in ms
  }
}));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB error:", err));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/signup.html'));
});

app.post('/signup', async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.send("Invalid input: " + error.details[0].message);

  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) return res.send("Email already registered.");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  req.session.user = { name };
  res.redirect('/members');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/login.html'));
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    console.log("User not found:", email);
    return res.send("User not found.");
  }

  console.log("Entered password:", password);
  console.log("Stored hash:", user.password);

  const match = await bcrypt.compare(password, user.password);
  console.log("Password match:", match);

  if (!match) return res.send("Invalid password.");

  req.session.user = { name: user.name };
  res.redirect('/members');
});

app.get('/members', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  const name = req.session.user.name;

  const images = ['cat1.jpg', 'cat2.jpg', 'cat3.jpg'];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  res.send(`
    <h1>Hello, ${name}!</h1>
    <a href="/logout">Logout</a>
    <br><br>
    <img src="/${randomImage}" alt="Random image" style="max-width:300px;">
  `);
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('*', (req, res) => {
  res.status(404).send("Page not found - 404");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
