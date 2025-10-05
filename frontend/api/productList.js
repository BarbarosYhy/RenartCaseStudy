const express = require('express');
const app = express();
const products = require('../products.json');



const TROY_OUNCE_TO_GRAM = 31.1035;

async function getGoldPrice() {
    const goldPriceUrl = "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD";
    const response = await fetch(goldPriceUrl);
    const data = await response.json();
    return data[0].spreadProfilePrices[0].bid/TROY_OUNCE_TO_GRAM;
   
}

async function getProductsWithPrice(){
    const goldPrice = await getGoldPrice();
    return products.map(product => {
        const productPrice = ((product.popularityScore + 1) * product.weight * goldPrice).toFixed(2);
        return {...product, productPrice};
    });

}


module.exports = async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    if (pathname === '/' || pathname === '/api') {
      return res.writeHead(302, { Location: '/api/productList' }).end();
    }

    if (pathname === '/api/productList') {
      const list = await getProductsWithPrice();
      return res.status(200).json(list);
    }

    if (pathname === '/api/productList/filter') {
      const products = await getProductsWithPrice();
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const minScore = searchParams.get('minScore');

      let result = products;
      if (minPrice && maxPrice) {
        result = result.filter(p =>
          p.productPrice >= Number(minPrice) && p.productPrice <= Number(maxPrice)
        );
        result.sort((a, b) => b.productPrice - a.productPrice);
      }

      if (minScore) {
        result = result.filter(p => p.popularityScore >= Number(minScore));
        result.sort((a, b) => b.popularityScore - a.popularityScore);
      }

      return res.status(200).json(result);
    }

    // 404 fallback
    res.status(404).json({ error: 'Not Found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to show products' });
  }
};
