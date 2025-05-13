const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

app.use(session({
  secret: 'MIREA',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.static('public'));

const users = new Map();
const CACHE_FILE = 'data-cache.json';
const CACHE_DURATION = 5 * 1000; // для наглядности обновления кэша, он будет устаревать черзе 5 секунд после создания

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Неавторизован' });
  }
  next();
};

const getCachedData = () => {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE));
      if (Date.now() - cache.data.timestamp < CACHE_DURATION) {
        return cache.data;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Неверное имя пользователя или пароль' });
  }
  if (users.has(username)) {
    return res.status(400).json({ error: 'Имя пользователя уже зарегистрировано' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(username, { password: hashedPassword });
  res.json({ message: 'Успешная регистрация' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.get(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Неправильное имя или пароль' });
  }
  req.session.userId = username;
  res.json({ message: 'Успешный вход' });
});

app.get('/profile', requireAuth, (req, res) => {
  res.json({ username: req.session.userId });
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Успешный выход' });
});

app.get('/data', async (req, res) => {
  let data = getCachedData();
  if (!data) {
    data = { timestamp: Date.now(), value: Math.random() };
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ data }));
  }
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`порт сервера ${PORT}`);
});