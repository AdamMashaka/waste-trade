require('dotenv').config();
const express = require('express');
const router = express.Router();
const {MongoClient, ObjectId} = require('mongodb');
const sendSMS = require('../utils/sendSMS');

router.get('/', (req, res) => {
    const wasteId = req.query.wasteId

    //fetching logic
    let uri = process.env.MONGO_URI;
    uri = uri.replace('<password>', process.env.MONGO_PASS);

    const client = new MongoClient(uri);

    async function wasteDetails() {
        try {
            const db = client.db('test');
            const consumersellmodels = db.collection('consumersellmodels');

            var id = new ObjectId(wasteId)
            
            const options = {
                projection: {
                    _id: 0, 
                    consumerName: 1, 
                    wasteType: 1, 
                    quantity: 1, 
                    description: 1, 
                    image: 1
                }
            }

            const details = await consumersellmodels.find({_id: id}, options).toArray()

            const detailsWithImage = details.map(product => {
                const imageDataBuffer = product.image.data;
                
                return {
                    ...product,
                    imageDataBase64: `data:${product.image.mimeType};base64,${imageDataBuffer}`
                };
            });
            
            // console.log(detailsWithImage);
            res.render('wasteView.ejs', {details: detailsWithImage})
        }catch(err){
            console.error(`An error occured: ${err}`);
            res.status(500).send('Internal Server Error...');
        } 
        finally {
            await client.close();
        }
    }

    wasteDetails();
});

router.post('/buyWithToken', (req, res) => {
    var tokenAgreed = parseInt(req.body.tokenAmount);
    var name = req.body.businessName;
    var walletPass = req.body.walletPass;
    var consumerName = req.body.consumerName;

    //connect with client and then query
    let uri = process.env.MONGO_URI;
    uri = uri.replace('<password>', process.env.MONGO_PASS);

    const client = new MongoClient(uri);

    async function verifyBusinessWallet() {
        try{
            const db = client.db('test');
            const businesses = db.collection('businesses');
            const consumers = db.collection('consumers');

            const businessDetails = await businesses.find({username: name}).toArray();
            const trueWalletPass = businessDetails[0].walletPass;
            const businessNo = businessDetails[0].number;

            const consumerDetails = await consumers.find({username: consumerName}).toArray();
            const consumerNo = consumerDetails[0].number;

            //checking if wallet password matches
            if(walletPass != trueWalletPass) {
                res.send('Incorect wallet credentials');
            } else {
                //if the wallet password is correct 
                //decrease value in business wallet
                await businesses.updateOne(
                    {username: name},
                    {$inc: {tokenAmount: -tokenAgreed}}
                )

                //increasing value in consumer wallet
                await consumers.updateOne(
                    {username: consumerName},
                    {$inc: {tokenAmount: tokenAgreed}}
                )

                //sending SMS
                //to business
                const textToBusiness =
                `You have successfully transfered ${tokenAgreed} tokens, to ${consumerName}`

                sendSMS(businessNo, textToBusiness);

                //to consumer
                const textToConsumer =
                `You have received ${tokenAgreed} tokens, from ${name}`

                sendSMS(consumerNo, textToConsumer);

                // res.redirect('/wasteView');
                res.send('successfully paid')
            }
        }catch(err){
            console.error(`An error occured: ${err}`);
            res.status(500).send('Internal Server Error...');
        }
        finally {
            await client.close()
        }
    }
    verifyBusinessWallet();
})

module.exports = router