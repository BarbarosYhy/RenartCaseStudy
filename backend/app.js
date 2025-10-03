const express = require('express');
const fs = require ('fs');
const app = express();

app.listen(3000);

app.get('/', (req,res) => {
    res.render('welcome',);
});