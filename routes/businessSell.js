const express = require('express');
const router = express.Router();
const multer = require('multer');
const BusinessSellModel = require('../models/businessSellModel');
// const {upload} = require('../utils/fileHelper');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.get('/:name', (req, res) => {
    const {name} = req.params;
    res.render('businessSell.ejs', {query: name})
})

router.post('/:name', upload.single('productImage'), (req, res) => {

    const {name} = req.params;

    var productName = req.body.productName;
    var productQuantity = req.body.productQuantity;
    var productDescription = req.body.productDescription;

    //checking if req.file is populated
    if(!req.file) {
        return res.status(400).send('No file provided');
    }

    //checking if req.file.buffer is populated
    if(!req.file.buffer) {
        console.log('no good');
        return res.status(400).send('Uploaded file is empty');
    }
    const imageBuffer = req.file.buffer;
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

    let newProduct = new BusinessSellModel({
        businessName: name, 
        productName: productName, 
        quantity: productQuantity, 
        description: productDescription,
        image: {
            data: imageBase64,
            mimeType: req.file.mimetype
        }
    })

    newProduct.save((newProduct));

    res.send('upload Success...');
})

module.exports = router