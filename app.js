require('dotenv').config({ quiet: true });
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const { STUDENT_ID, STUDENT_NAME, VAT_RATE, CODE_PREFIX } = require('./config');
const { writeConn, BookReader, BookWriter } = require('./db');
const { prepareBook } = require('./book-logic');

const app = express();
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: false }));
app.set('trust proxy', 1); // chạy sau proxy của Render
if (!process.env.SESSION_SECRET) throw new Error('Thiếu biến môi trường SESSION_SECRET');

// Stateless: session KHÔNG nằm trong RAM mà lưu tập trung ở collection
// "sessions" trên MongoDB Atlas -> nhiều instance dùng chung khi auto-scaling.
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise: writeConn.asPromise().then((c) => c.getClient()),
    dbName: 'DB_23IT223',
    collectionName: 'sessions',
    ttl: 60 * 60, // 1 giờ
  }),
  cookie: { maxAge: 60 * 60 * 1000, httpOnly: true },
}));

// Footer: Họ tên, MSSV, VAT có mặt ở mọi trang
app.use((req, res, next) => {
  Object.assign(res.locals, { STUDENT_ID, STUDENT_NAME, VAT_RATE, CODE_PREFIX });
  next();
});

async function renderHome(req, res, extra = {}) {
  // Luồng ĐỌC -> tài khoản read
  const books = await BookReader.find().sort({ createdAt: -1 }).lean();
  req.session.views = (req.session.views || 0) + 1;
  const flash = req.session.flash;
  delete req.session.flash;
  res.render('home', {
    books, flash, views: req.session.views, addedCount: req.session.addedCount || 0, sessionId: req.sessionID, ...extra,
  });
}

app.get('/', (req, res) => renderHome(req, res));

app.post('/books', async (req, res) => {
  const { error, book } = prepareBook(req.body);
  if (error) return renderHome(req, res.status(400), { error }); // từ chối xử lý
  // Luồng GHI -> tài khoản write
  await BookWriter.create(book);
  req.session.addedCount = (req.session.addedCount || 0) + 1;
  req.session.flash = `Đã thêm "${book.title}" - giá sau VAT ${book.vatRate}%: ${book.priceAfterVat}`;
  res.redirect('/');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Lỗi máy chủ: ' + err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
