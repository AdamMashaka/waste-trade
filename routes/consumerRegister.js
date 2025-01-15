require('dotenv').config();
const express = require('express');
const router = express.Router();
const {MongoClient} = require('mongodb');
const Consumer = require('../models/consumer');
const keyGen = require('../utils/keyGenerator');
const sendSMS = require('../utils/sendSMS');

let uri = process.env.MONGO_URI;
uri = uri.replace('<password>', process.env.MONGO_PASS);

const client = new MongoClient(uri);

router.get('/', (req, res) => {
    res.render('consumerRegister.ejs');
})

router.post('/', async (req, res) => {
    try{
        var name = req.body.username;
        var phoneNumber = req.body.No;
        var email = req.body.email;
        var pass = req.body.password;

        const walletPass = keyGen();

        Consumer.register({
            username: name, 
            number: phoneNumber, 
            email: email,
            walletPass: walletPass,
            tokenAmount: 10, 
            active: false}, pass);

            //querying phone number from collection
            const db = client.db('test');
            const consumers = db.collection('consumers');

            const consumerDetails = await consumers.find({username: name}).toArray();
            const consumerNo = consumerDetails[0].number;

            const text = 
            `Welcome ${name}, You have successfully registered, Your Token wallet password is ${walletPass}, please keep it safe`

            sendSMS(consumerNo, text);

        res.redirect(`/consumerDashboard/${name}`)
    }catch(err) {
        console.error(`An error occured: ${err}`);
        res.status(500).send('Internal Server Error...');
    }
})

module.exports = router