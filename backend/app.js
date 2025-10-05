const express = require('express');

const app = express();

app.listen(3000);


const products = require('./products.json');


async function getGoldPrice() {
    const goldPriceUrl = "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD";
    const response = await fetch(goldPriceUrl);
    const data = await response.json();
    return data[0].spreadProfilePrices[0].bid;
   
}

async function getProductsWithPrice(){
    const goldPrice = await getGoldPrice();
    return products.map(product => {
        const productPrice = ((product.popularityScore + 1) * product.weight * goldPrice).toFixed(2);
        return {...product, productPrice};
    });

}

app.get('/', async (req,res) => {
   res.redirect('/productList');
});

app.get('/productList', async (req,res) => {
    try{
        const products = await getProductsWithPrice();
        res.json(products);
    }
    catch (err){
        console.error(err);
        res.status(500).json({error: "Failed to show products"});
    }
    
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
    res.json(products);
});

