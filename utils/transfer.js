const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    AccountBalanceQuery,
    Hbar,
    TransferTransaction,
  } = require("@hashgraph/sdk");
  require("dotenv").config();
  
  module.exports = async function main(AccountId, senderAmount, receiverAmount) {
    // Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;
  
    // If we weren't able to grab it, we should throw a new error
    if (myAccountId == null || myPrivateKey == null) {
      throw new Error(
        "Environment variables myAccountId and myPrivateKey must be present"
      );
    }
  
    // Create your connection to the Hedera network
    const client = Client.forTestnet();
  
    //Set your account as the client's operator
    client.setOperator(myAccountId, myPrivateKey);

    const newAccountId = AccountId;

    //Create the transfer transaction
    const sendHbar = await new TransferTransaction()
    .addHbarTransfer(myAccountId, Hbar.fromTinybars(senderAmount)) //Sending account
    .addHbarTransfer(newAccountId, Hbar.fromTinybars(receiverAmount)) //Receiving account
    .execute(client);

    const transactionRx = await sendHbar.getReceipt(client);
    console.log(`Status of txn: ${transactionRx.status}`);
    
    const getNewBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log(`New Balance: ${getNewBalance.hbars.toTinybars()}`);

    client.close()
  }