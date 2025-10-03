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



app.get('/products/price', async (req, res) => {
    const goldPrice = await getGoldStandardBidAskPrice();
    
    const productPrices = products.map(product => {
        return (product.popularityScore + 1) * product.weight * goldPrice;
    });
    res.json(productPrices);
})

async function getGoldStandardBidAskPrice() {
    const goldPriceUrl = "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD";
    const response = await fetch(goldPriceUrl);
    const data = await response.json();
    return data[0].spreadProfilePrices[0].bid;
}