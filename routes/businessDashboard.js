require('dotenv').config();
const express = require('express');
const connectEnsureLogin = require('connect-ensure-login');
const router = express.Router();
const {MongoClient} = require('mongodb');
const sendSMS = require('../utils/sendSMS');
const hedera = require('../utils/transfer');
const hbarAmount = require('../utils/hbarAmount');

let uri = process.env.MONGO_URI;
uri = uri.replace('<password>', process.env.MONGO_PASS);

router.get('/:name', connectEnsureLogin.ensureLoggedIn('/businessLogin'), (req, res) => {
    const {name} = req.params;

    //querying the db for the amount of tokens available
    const client = new MongoClient(uri);

    async function fetchBtokenAmount() {
        try{
            const db = client.db('test');
            const businesses = db.collection('businesses')

            const businessDetails = await businesses.find({username: name}).toArray();
            const bTokenAmount = businessDetails[0].tokenAmount;
            const hederaAccID = businessDetails[0].hederaAccID;
            console.log(bTokenAmount);

            const hbars = await hbarAmount(hederaAccID)
            // console.log(hbars.low);
            const hbarBalance = hbars.low;

            res.render('businessDashboard.ejs', {query: name, tokens: bTokenAmount, tinybars: hbarBalance});
            
        }catch(err){
            console.error(`An error occured: ${err}`);
            res.status(500).send('Internal Server Error...');
        }
        finally {
            await client.close();
        }
    }

    fetchBtokenAmount();

})

router.post('/hedera/:name', (req, res) => {
    const {name} = req.params;
    const tokensBought = parseInt(req.body.token);

    async function addTokensHedera() {
        const client = new MongoClient(uri);

        try {
            const db = client.db('test');
            const businesses = db.collection('businesses');

            const businessDetails = await businesses.find({username: name}).toArray();
            const hederaAccID = businessDetails[0].hederaAccID;

            hedera(hederaAccID, -tokensBought, tokensBought);

             //updating and persisting data try#2
             await businesses.updateOne(
                {username: name},
                {$inc: {tokenAmount: tokensBought}}
            )

            //querying the phone number
            // const businessDetails = await businesses.find({username: name}).toArray();
            const businessNo = businessDetails[0].number;
            const currentToken = businessDetails[0].tokenAmount;

            sendSMS(businessNo, `Your company has bought: ${tokensBought} token(s), you currently have: ${currentToken}`);

            res.redirect(`/businessDashboard/${name}`);


        }catch(err) {
            console.error(`An error occured: ${err}`);
            res.status(500).send('Internal Server Error...');
        } 
        finally {
            await client.close()
        }
    }
    addTokensHedera()
})

router.post('/:name', (req, res) => {
    const {name} = req.params;
    const tokensBought = parseInt(req.body.token);

    async function addTokens() {
        const client = new MongoClient(uri);

        try {
            const db = client.db('test');
            const businesses = db.collection('businesses');
            
            //updating and persisting data try#2
            await businesses.updateOne(
                {username: name},
                {$inc: {tokenAmount: tokensBought}}
            )

            //querying the phone number
            const businessDetails = await businesses.find({username: name}).toArray();
            const businessNo = businessDetails[0].number;
            const currentToken = businessDetails[0].tokenAmount;

            sendSMS(businessNo, `Your company has bought: ${tokensBought} token(s), you currently have: ${currentToken}`);

            res.redirect(`/businessDashboard/${name}`);
        }catch(err) {
            console.error(`An error occured: ${err}`);
            res.status(500).send('Internal Server Error...')
        }
        finally {
            client.close();
        }
    }
    addTokens()
})

module.exports = router