require('dotenv').config({ quiet: true });
const express = require('express');
const { engine } = require('express-handlebars');
const { STUDENT_ID, STUDENT_NAME, VAT_RATE, CODE_PREFIX } = require('./config');
const { BookReader, BookWriter } = require('./db');
const { prepareBook } = require('./book-logic');

const app = express();
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: false }));

// Footer: Họ tên, MSSV, VAT có mặt ở mọi trang
app.use((req, res, next) => {
  Object.assign(res.locals, { STUDENT_ID, STUDENT_NAME, VAT_RATE, CODE_PREFIX });
  next();
});

async function renderHome(res, extra = {}) {
  // Luồng ĐỌC -> tài khoản read
  const books = await BookReader.find().sort({ createdAt: -1 }).lean();
  res.render('home', { books, ...extra });
}

app.get('/', (req, res) => renderHome(res));

app.post('/books', async (req, res) => {
  const { error, book } = prepareBook(req.body);
  if (error) return renderHome(res.status(400), { error }); // từ chối xử lý
  // Luồng GHI -> tài khoản write
  await BookWriter.create(book);
  res.redirect('/');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Lỗi máy chủ: ' + err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
