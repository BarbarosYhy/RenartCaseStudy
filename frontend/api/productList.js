// If your project does NOT have `"type": "module"` in package.json, use this CommonJS version.
const products = require('../products.json');

const TROY_OUNCE_TO_GRAM = 31.1035;

async function getGoldPrice() {
  const goldPriceUrl = 'https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD';

  // Add timeout + UA + safe fallback so this never kills the function
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const resp = await fetch(goldPriceUrl, {
      headers: { 'user-agent': 'Mozilla/5.0 (Vercel Serverless)' },
      signal: controller.signal,
    });
    const data = await resp.json();
    const bid = data?.[0]?.spreadProfilePrices?.[0]?.bid;
    if (!bid) throw new Error('Missing bid');
    return bid / TROY_OUNCE_TO_GRAM;
  } catch (err) {
    console.error('[goldPrice] using fallback:', err.message);
    // Fallback USD/gram so your app still works if the API is down/blocked
    return 75;
  } finally {
    clearTimeout(timer);
  }
}

async function getProductsWithPrice() {
  const goldPrice = await getGoldPrice();
  return products.map((product) => {
    const productPrice = ((product.popularityScore + 1) * product.weight * goldPrice).toFixed(2);
    return { ...product, productPrice: Number(productPrice) };
  });
}

// One file = one route: /api/productList
module.exports = async function handler(req, res) {
  try {
    const list = await getProductsWithPrice();
    res.status(200).json(list);
  } catch (err) {
    console.error('[productList] fatal:', err);
    res.status(500).json({ error: 'Failed to show products' });
  }
};
