require('dotenv').config();
const express = require('express');
const router = express.Router();
const {MongoClient} = require('mongodb');


router.get('/', (req, res) => {
    //fetch from business db
    let uri = process.env.MONGO_URI;
    uri = uri.replace('<password>', process.env.MONGO_PASS);

    const client = new MongoClient(uri);

    async function businessProducts() {
        try {
            const db = client.db('test');
            const businesssellmodels = db.collection('businesssellmodels');

            const productsWithImages = await businesssellmodels.find({}).toArray();

            const productData = productsWithImages.map(product => {
                const imageDataBuffer = product.image.data;

                return {
                    ...product,
                    imageDataBase64: `data:${product.image.mimeType};base64,${imageDataBuffer}`
                };
            });
            const productDataJson = JSON.parse(JSON.stringify(productData));

            res.json(productDataJson);
        }catch(err){
            console.error(`An error occured: ${err}`);
            res.status(500).send('Internal Server Error...');
        } 
        finally {
            await client.close();
        }
    }

    businessProducts()

})

router.get('/consumerBrowseView', (req, res) => {
    res.render('consumerBrowse.ejs');
})

module.exports = router