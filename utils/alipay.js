const { AlipaySdk } = require('alipay-sdk');

const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APPID,
  privateKey: process.env.ALIPAY_APP_PRIVATE_KEY,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY
});

module.exports = alipaySdk;
