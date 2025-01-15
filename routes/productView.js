require('dotenv').config();
const express = require('express');
const router = express.Router();
const {MongoClient, ObjectId} = require('mongodb');

router.get('/', (req, res) => {
    const productId = req.query.productId

    //fetching logic
    let uri = process.env.MONGO_URI;
    uri = uri.replace('<password>', process.env.MONGO_PASS);

    const client = new MongoClient(uri);

    async function productDetails() {
        try {
            const db = client.db('test');
            const businesssellmodels = db.collection('businesssellmodels');

            var id = new ObjectId(productId);

            const options = {
                projection: {
                  _id: 1,
                  businessName: 1,
                  productName: 1,
                  productPrice: 1,
                  quantity: 1,
                  description: 1,
                  image: 1  
                }
            }

            const details = await businesssellmodels.find({_id: id}, options).toArray()

            const detailsWithImage = details.map(product => {
                const imageDataBuffer = product.image.data;

                return {
                    ...product,
                    imageDataBase64: `data:${product.image.mimeType};base64,${imageDataBuffer}`
                };
            });

            res.render('productView.ejs', {details: detailsWithImage})
        }catch(err) {
            console.error(`An error occured: ${err}`);
            res.status(500).send('Internal Server Error...');
        }
        finally {
            await client.close();
        }
    }

    productDetails();
    
})


module.exports = router