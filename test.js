const assert = require('assert');
const { prepareBook } = require('./book-logic');

assert.match(prepareBook({ code: '111001', title: 'A', price: 100 }).error, /223/);
assert.ok(prepareBook({ code: '223001', title: '', price: 100 }).error);
assert.ok(prepareBook({ code: '223001', title: 'A', price: -1 }).error);
assert.deepStrictEqual(prepareBook({ code: '223001', title: 'Sách A', price: 100000 }).book,
  { code: '223001', title: 'Sách A', price: 100000, vatRate: 7, priceAfterVat: 107000 });
console.log('OK: tất cả kiểm tra prepareBook đều đạt');
