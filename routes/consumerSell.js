const express = require('express');
const router = express.Router();
const ConsumerSellModel = require('../models/consumerSellModel');
const multer = require('multer');
// const {upload} = require('../utils/fileHelper')
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.get('/:name', (req, res) => {
    const {name} = req.params;
    res.render('consumerSell.ejs', {query: name})
})

router.post('/:name', upload.single('wasteImage'), (req, res) => {
    try{
        const {name} = req.params;

        console.log(req.file.path);
        var wasteType = req.body.wasteType;
        var quantity = req.body.quantity;
        var desc = req.body.description;

        //checking if req.file is populated
        if(!req.file) {
            return res.status(400).send('No file was provided');
        }

        //checking if req.file.buffer is populated
        if(!req.file.buffer) {
            return res.status(400).send('Uploaded file is empty')
        }
        const imageBuffer = req.file.buffer;
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');

        let newWaste = new ConsumerSellModel({
            consumerName: name,
            wasteType: wasteType, 
            quantity: quantity, 
            description: desc,
            image: {
                data: imageBase64,
                mimeType: req.file.mimetype
            }
        });

        newWaste.save((newWaste));

        res.redirect(`/consumerDashboard/${name}`);
    }catch(err) {
        console.error(`An error occured: ${err}`);
        res.status(500).send('Internal Server Error...');
    }
})

module.exports = router