const sha256 = require('js-sha256');


class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return sha256(
      this.index +
      this.timestamp +
      this.data +
      this.nonce +
      this.previousHash
    );
  }

  getAnswer(difficulty) {
    let answer = "";
    for (let i = 0; i < difficulty; i++) {
        answer += "0";
    }
    return answer;
  }
  mineBlock(difficulty) {
    while (true) {
     if(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')){
    //   if(this.hash.substring(0, difficulty) !== this.getAnswer(difficulty)){
        this.nonce++;
        this.hash = this.calculateHash();
      }else{
      break
    }
}
    console.log(`Block mined: ${this.hash}`);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), 'Genesis Block');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    // newBlock.hash = newBlock.calculateHash();
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  isValidChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log('数据校验失败，区块哈希不匹配，数据可能被篡改');
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log('前后区块链断裂');
        return false;
      }
    }

    return true;
  }
}

const blockchain = new Blockchain();

console.log(blockchain.chain);

blockchain.addBlock(new Block(1, Date.now(), { amount: 4 }));
blockchain.addBlock(new Block(2, Date.now(), { amount: 10 }));


console.log(blockchain.isValidChain());
console.log(blockchain.chain);