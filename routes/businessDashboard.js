require('dotenv').config();
const express = require('express');
const connectEnsureLogin = require('connect-ensure-login');
const router = express.Router();
const {MongoClient} = require('mongodb');
const sendSMS = require('../utils/sendSMS');

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
            console.log(bTokenAmount);

            res.render('businessDashboard.ejs', {query: name, tokens: bTokenAmount});
            
        }finally {
            await client.close();
        }
    }

    fetchBtokenAmount();

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
        }finally {
            client.close();
        }
    }
    addTokens()
})

module.exports = router