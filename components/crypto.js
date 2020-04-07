const crypto = require("crypto");

const iv = "asd2344rtdfrtrw4";

function encrypt(text, key) {
  let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

function decrypt(text, key) {
  let decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(text, "base64", "utf8");
  return decrypted + decipher.final("utf8");
}

module.exports = { encrypt, decrypt };
