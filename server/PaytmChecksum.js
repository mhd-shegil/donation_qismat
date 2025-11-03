import crypto from "crypto";

class PaytmChecksum {
  static generateSignature(params, key) {
    const data = Object.keys(params)
      .sort()
      .map((k) => params[k])
      .join("|");
    return crypto.createHmac("sha256", key).update(data).digest("base64");
  }
}

export default PaytmChecksum;
