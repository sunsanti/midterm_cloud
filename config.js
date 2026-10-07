// Thông tin cá nhân hóa (không phải bí mật nên để trong code)
const STUDENT_ID = '23IT223';
const STUDENT_NAME = 'Dương Đăng Quân';

const digits = STUDENT_ID.replace(/\D/g, '');
const CODE_PREFIX = digits.slice(-3); // 3 số cuối MSSV -> "223"
const VAT_RATE = Number(digits.slice(-1)) + 4; // (chữ số cuối + 4)% -> 7

module.exports = { STUDENT_ID, STUDENT_NAME, CODE_PREFIX, VAT_RATE };
