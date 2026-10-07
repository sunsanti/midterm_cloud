const mongoose = require('mongoose');

const { MONGO_URI_READ, MONGO_URI_WRITE } = process.env;
if (!MONGO_URI_READ || !MONGO_URI_WRITE) {
  throw new Error('Thiếu biến môi trường MONGO_URI_READ / MONGO_URI_WRITE');
}

// 2 kết nối độc lập, mỗi kết nối dùng 1 tài khoản có quyền tối thiểu.
// autoIndex/autoCreate tắt vì tài khoản không có quyền quản trị collection.
const opts = { dbName: 'DB_23IT223', autoIndex: false, autoCreate: false };
const readConn = mongoose.createConnection(MONGO_URI_READ, opts);
const writeConn = mongoose.createConnection(MONGO_URI_WRITE, opts);

const bookSchema = new mongoose.Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  vatRate: { type: Number, required: true },
  priceAfterVat: { type: Number, required: true },
}, { timestamps: true });

// Cùng 1 schema, gắn vào 2 kết nối khác nhau
const BookReader = readConn.model('Book', bookSchema, 'books'); // chỉ dùng để đọc
const BookWriter = writeConn.model('Book', bookSchema, 'books'); // chỉ dùng để ghi

module.exports = { readConn, writeConn, BookReader, BookWriter };
