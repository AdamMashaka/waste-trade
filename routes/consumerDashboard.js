require('dotenv').config();
const express = require('express');
// const connectEnsureLogin = require('connect-ensure-login');
const router = express.Router();
const {MongoClient} = require('mongodb');

router.get('/:name', (req, res) => {
    const {name} = req.params

    //querying the database to get the number of tokens available
    let uri = process.env.MONGO_URI;
    uri = uri.replace('<password>', process.env.MONGO_PASS);

    const client = new MongoClient(uri);

    async function fetchTokenAmount() {
        try {
            const db = client.db('test');
            const consumers = db.collection('consumers');

            const consumerDetails = await consumers.find({username: name}).toArray();
            const tokenAmount = consumerDetails[0].tokenAmount;
            // const tokenAmount = 60
            console.log(tokenAmount);
            // console.log(tokenAmount);

            res.render('consumerDashboard.ejs', {consumerName: name, tokens: tokenAmount});
        } catch(err){
            res.status(500).send('internal server error')
        }
    }

    fetchTokenAmount()
})

module.exports = router
