const express = require('express');

const app = express();

app.listen(3000);


const products = require('./products/products.json');


app.get('/', async (req,res) => {
   console.log("Hi World");
});

app.get('/products', (req,res) => {
    res.json(products);
});

app.get('/products/price', async (req, res) => {
    const productPrices = await getProductRealTimePrices();
    
    
    res.json(productPrices);
});

app.get('/products/price/filter', async (req,res) => {
    const productPrices = await getProductRealTimePrices();
    const {min, max} = req.query;

    const descendedProducts = productPrices.filter((price) => {
        return price >= min && price <= max;
    }).sort();

    res.json(descendedProducts);
});

app.get('/products/filter', (req,res) => {
    const {popularityScore} = req.query;

    const descendedProducts = productPrices.filter((price) => {
        return price >= min && price <= max;
    }).sort();

    res.json(descendedProducts);
});

async function getProductRealTimePrices() {
    const goldPriceUrl = "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD";
    const response = await fetch(goldPriceUrl);
    const data = await response.json();
    const goldPrice = data[0].spreadProfilePrices[0].bid;
    const productPrices = products.map(product => {
        return ((product.popularityScore + 1) * product.weight * goldPrice).toFixed(2);
    });
    return productPrices;
}