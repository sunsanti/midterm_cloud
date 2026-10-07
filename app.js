require('dotenv').config({ quiet: true });
const express = require('express');
const { engine } = require('express-handlebars');
const { STUDENT_ID, STUDENT_NAME, VAT_RATE } = require('./config');

const app = express();
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: false }));

// Footer: Họ tên, MSSV, VAT có mặt ở mọi trang
app.use((req, res, next) => {
  Object.assign(res.locals, { STUDENT_ID, STUDENT_NAME, VAT_RATE });
  next();
});

app.get('/', (req, res) => res.render('home', { books: [] }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
