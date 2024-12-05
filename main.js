const sha256 = require('js-sha256');


class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return sha256(
      this.index +
      this.timestamp +
      this.data +
      this.previousHash
    );
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), 'Genesis Block');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
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


console.log(blockchain.isValidChain()); // true
console.log(blockchain.chain);