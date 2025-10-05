// CommonJS serverless function (Vercel Node 18+)
const products = require('../products.json');

const TROY_OUNCE_TO_GRAM = 31.1035;

async function getGoldPrice() {
  const goldPriceUrl = "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD";

  // Hardened fetch with UA + timeout (Swissquote sometimes blocks generic bots)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(goldPriceUrl, {
      headers: { 'user-agent': 'Mozilla/5.0 (serverless) Vercel' },
      signal: controller.signal
    });
    const data = await response.json();
    const bid = data?.[0]?.spreadProfilePrices?.[0]?.bid;
    if (!bid) throw new Error('Gold price missing');
    return bid / TROY_OUNCE_TO_GRAM;
  } catch (err) {
    console.error('[goldPrice] fallback used:', err.message);
    // Fallback: use a conservative static price per gram (USD)
    return 75; // adjust if you want
  } finally {
    clearTimeout(timer);
  }
}

async function getProductsWithPrice(){
  const goldPrice = await getGoldPrice();
  return products.map(product => {
    const productPrice = ((product.popularityScore + 1) * product.weight * goldPrice).toFixed(2);
    return {...product, productPrice: Number(productPrice)};
  });
}

module.exports = async function handler(req, res) {
  try {
    const list = await getProductsWithPrice();
    return res.status(200).json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to show products" });
  }
};
