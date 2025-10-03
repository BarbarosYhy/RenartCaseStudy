const express = require('express');

const app = express();

app.listen(3000);


const products = require('./products/products.json');


app.get('/', async (req,res) => {
   console.log("Hi World");
});

app.get('/products', (req,res) => {
    res.json(products);
})

app.get('/goldPrice', async (req,res) => {
    const goldPriceUrl = "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD";
    const response = await fetch(goldPriceUrl);
    const data = await response.json();
    const goldPrice = data[0].spreadProfilePrices[0].bid;
    res.json(goldPrice);
})