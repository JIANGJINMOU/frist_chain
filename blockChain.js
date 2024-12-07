const sha256 = require("js-sha256");
const ecLib = require("elliptic").ec;
const ec = new ecLib("secp256k1");

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  calculateHash() {
    return sha256(this.fromAddress + this.toAddress + this.amount);
  }

  sign(key) {
    this.signature = key.sign(this.calculateHash(), "base64").toDER("hex");
  }

  isValid() {
    if(this.fromAddress === null)
      return true
    if(!this.signature)
      throw new Error('sign missing')
    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
    return publicKey.verify(this.calculateHash(), this.signature)
  }
}

class Block {
  constructor(index, timestamp, transactions, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return sha256(
      this.index +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce +
        this.previousHash
    );
  }

  //   getAnswer(difficulty) {
  //     let answer = "";
  //     for (let i = 0; i < difficulty; i++) {
  //       answer += "0";
  //     }
  //     return answer;
  //   }

  mineBlock(difficulty) {
    while (true) {
      if (
        this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
      ) {
        //   if(this.hash.substring(0, difficulty) !== this.getAnswer(difficulty)){
        this.nonce++;
        this.hash = this.calculateHash();
      } else {
        break;
      }
    }
    console.log(`Block mined(挖矿结束): ${this.hash}`);
  }

  validateTransactions(){
    for(let transaction of this.transactions){
      if(!transaction.isValid()){
        console.log('非法交易')
        return false
      }
    }
    return true
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.transactionPool = [];
    this.minerReward = 50;
    this.difficulty = 4;
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), "Genesis Block");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    this.transactionPool.push(transaction);
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    // newBlock.hash = newBlock.calculateHash();
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  mineTransactionPool(minerRewardAddress) {
    const transaction = new Transaction(
      null,
      minerRewardAddress,
      this.minerReward
    );
    this.transactionPool.push(transaction);
    // this.index + this.timestamp + this.data + this.nonce + this.previousHash

    const newBlock = new Block(
      this.transactionPool,
      this.getLatestBlock().hash
    );
    newBlock.mineBlock(this.difficulty);

    this.chain.push(newBlock);
    this.transactionPool = [];
    // console.log(`Transaction added to block ${block.index}`);
  }

  isValidChain() {
    if (this.chain.length === 1) {
      if (this.chain[0].hash !== this.chain[0].calculateHash()) {
        return false;
      }
      return true;
    }

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      

      if (!currentBlock.validateTransactions()) {
        console.log("区块数据校验失败，交易数据可能被篡改");
        return false;
        }
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log("数据校验失败，区块哈希不匹配，数据可能被篡改");
        return false;
      }
      const previousBlock = this.chain[i - 1];
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log("前后区块链断裂");
        return false;
      }
    }

    return true;
  }
}

// module.exports = { Blockchain, Transaction, Block }

// const blockchain = new Blockchain();
// const keyPairSender = ec.genKeyPair();
// const privatekeyPairSender = keyPairSender.getPrivate('hex');
// const publickeyPairSender = keyPairSender.getPublic('hex');
// const keyPairReceiver = ec.genKeyPair();
// const privatekeyPairReceiver = keyPairReceiver.getPrivate('hex');
// const publickeyPairReceiver = keyPairReceiver.getPublic('hex');

// const transaction1 = new Transaction(
//   publickeyPairSender,
//   publickeyPairReceiver,
//   10
//   );
//   transaction1.sign(keyPairSender);
// console.log(transaction1);
// console.log(transaction1.isValid());

// blockchain.addBlock(new Block(1, Date.now(), "Block 1"));
// blockchain.addBlock(new Block(2, Date.now(), "Block 2"));

// const block1 = new Transaction("Alice", "Bob", 10);
// const block2 = new Transaction("Bob", "Charlie", 5);
// blockchain.addTransaction(block1);
// blockchain.addTransaction(block2);

// console.log(blockchain.chain);
// console.log(blockchain.isValidChain());

// blockchain.mineTransactionPool("Miner");
// console.log(blockchain);
// console.log(blockchain.chain[1]);
// console.log(blockchain.chain[1].data);
