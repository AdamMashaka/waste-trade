require('dotenv').config();
const express = require('express');
const connectEnsureLogin = require('connect-ensure-login');
const router = express.Router();
const {MongoClient} = require('mongodb');

router.get('/', (req, res) => {
    //fetching logic here
    let uri = process.env.MONGO_URI;
    uri = uri.replace('<password>', process.env.MONGO_PASS);

    const client = new MongoClient(uri);

    async function consumerProducts() {
        try{
            const db = client.db('test');
            const consumersellmodels = db.collection('consumersellmodels');

            const productDetails = await consumersellmodels.find({}).toArray();

            const productData = productDetails.map(product => {
                const imageDataBuffer = product.image.data;
                
                return {
                    ...product,
                    imageDataBase64: `data:${product.image.mimeType};base64,${imageDataBuffer}`
                };
            });
            const productDetailsJson = JSON.parse(JSON.stringify(productData));
            
            res.json(productDetailsJson);
        }catch(err) {
            console.error(`An Error occured: ${err}`);
            res.status(500).send('Internal Server Error');
        }
        finally{
            await client.close();
        }
    }
    consumerProducts();
})

router.get('/businessBrowseView', connectEnsureLogin.ensureLoggedIn('/businessLogin'), (req, res) => {
    res.render('businessBrowse.ejs');
})

module.exports = router