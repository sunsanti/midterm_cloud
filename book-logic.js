const { CODE_PREFIX, VAT_RATE } = require('./config');

// Kiểm tra mã SP + tính giá sau thuế. Trả về { error } hoặc { book }.
function prepareBook({ code, title, price }) {
  code = String(code || '').trim();
  title = String(title || '').trim();
  price = Number(price);

  if (!code.startsWith(CODE_PREFIX)) {
    return { error: `Mã sản phẩm "${code}" không hợp lệ: bắt buộc bắt đầu bằng ${CODE_PREFIX}` };
  }
  if (!title) return { error: 'Tên sách không được để trống' };
  if (!Number.isFinite(price) || price < 0) return { error: 'Giá không hợp lệ' };

  const priceAfterVat = Math.round(price * (100 + VAT_RATE)) / 100;
  return { book: { code, title, price, vatRate: VAT_RATE, priceAfterVat } };
}

module.exports = { prepareBook };
