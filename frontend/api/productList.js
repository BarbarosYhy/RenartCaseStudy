import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const products = require('../products.json'); // <-- works in ESM

const TROY_OUNCE_TO_GRAM = 31.1035;

async function getGoldPrice() {
  const goldPriceUrl = "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD";
  const response = await fetch(goldPriceUrl);
  const data = await response.json();
  return data[0].spreadProfilePrices[0].bid / TROY_OUNCE_TO_GRAM;
}

async function getProductsWithPrice() {
  const goldPrice = await getGoldPrice();
  return products.map(product => {
    const productPrice = ((product.popularityScore + 1) * product.weight * goldPrice).toFixed(2);
    return { ...product, productPrice };
  });
}

export default async function handler(req, res) {
  try {
    const list = await getProductsWithPrice();
    return res.status(200).json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to show products" });
  }
}
