const express = require('express');

const app = express();

app.listen(3000);


const products = require('./products.json');

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


app.get('/productList/filter', async (req,res) => {
    try{
        const products = await getProductsWithPrice();
        const {minPrice, maxPrice, minScore} = req.query;
        
        let result = products;
        if(minPrice&&maxPrice){
            result = result.filter((p) => { return p.productPrice >= Number(minPrice) && p.productPrice <= Number(maxPrice);});
            result.sort((a, b) => b.productPrice - a.productPrice);
        }
        if(minScore){
            result = result.filter((p) => { return p.popularityScore >= Number(minScore);});
            result.sort((a, b) => b.popularityScore - a.popularityScore);
        }


        res.json(result);
        
    }
    catch (err){
        console.error(err);
        res.status(500).json({error: "Failed to show products"});
    }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});
