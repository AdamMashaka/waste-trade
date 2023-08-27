require('dotenv').config();
const express = require('express');
const router = express.Router();
const Business = require('../models/business');
const keyGen = require('../utils/keyGenerator');
const sendSMS = require('../utils/sendSMS');
const {MongoClient} = require('mongodb');

let uri = process.env.MONGO_URI;
uri = uri.replace('<password>', process.env.MONGO_PASS);

const client = new MongoClient(uri)

router.get('/', (req, res) => {
    res.render('businessRegister.ejs');
})

router.post('/', async (req, res) => {
    var name = req.body.name;
    var pass = req.body.password;
    var type = req.body.businessType;
    var phoneNo = req.body.phoneNumber;
    var email = req.body.email;

    const walletPass = keyGen();

    const db = client.db('test');
    const businesses = db.collection('businesses');

    try {
        const businessName = await businesses.findOne({username: name});
        if (businessName) {
            console.log('name already exists');
            req.flash('error_msg', 'name already exists');//flash message is not being displayed fix it!!!
            return res.redirect('/businessRegister');
        } else {
            Business.register({
                username: name, 
                number: phoneNo,
                email: email,
                type: type, 
                walletPass: walletPass,
                tokenAmount: 123,
                active:false}, pass);

                //Sending SMS
                const text = 
                `You have successfully registered, your wallet password is: ${walletPass}`;

                sendSMS(phoneNo, text);

            req.flash('info', 'successfully registered');
            res.redirect(`/businessDashboard/${name}`)
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('500  Internal Server Error')
    }

})

module.exports = router