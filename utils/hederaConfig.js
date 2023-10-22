const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");
require('dotenv').config();

module.exports = async function environmentSetup() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    //Create your Hedera Testnet client
const client = Client.forTestnet();

//Set your account as the client's operator
client.setOperator(myAccountId, myPrivateKey);

const newAccountPrivateKey = PrivateKey.generateED25519();
const newAccountPublicKey = newAccountPrivateKey.publicKey;

const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

const getReceipt = await newAccount.getReceipt(client);
const newAccountId = getReceipt.accountId;

console.log(`new account ID: ${newAccountId}`);

// //Set the default maximum transaction fee (in Hbar)
// client.setDefaultMaxTransactionFee(new Hbar(100));

// //Set the maximum payment for queries (in Hbar)
// client.setMaxQueryPayment(new Hbar(50));
console.log('success');
client.close();

return newAccountId;
}
// environmentSetup();
