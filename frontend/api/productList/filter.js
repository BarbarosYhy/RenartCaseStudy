import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const products = require('../../products.json');

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
    const url = new URL(req.url, `http://${req.headers.host}`);
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const minScore = url.searchParams.get('minScore');

    let result = await getProductsWithPrice();

    if (minPrice && maxPrice) {
      const lo = Number(minPrice), hi = Number(maxPrice);
      result = result
        .filter(p => p.productPrice >= lo && p.productPrice <= hi)
        .sort((a, b) => b.productPrice - a.productPrice);
    }

    if (minScore) {
      const ms = Number(minScore);
      result = result
        .filter(p => p.popularityScore >= ms)
        .sort((a, b) => b.popularityScore - a.popularityScore);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to show products" });
  }
}
