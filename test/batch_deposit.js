const BatchDeposit = artifacts.require("BatchDeposit")

function fillArray(v, l) {
  let ret = [];
  for (let i = 0; i < l; i++)
    ret.push(v);
  return ret;
}

contract('BatchDeposit', (accounts) => {
  let stakes = [{
    amount: '32000000000',
    deposit_root: '0x712d4134beb822173fd6682f5a43a8240c250d43aef50b5fc2e785276a7f5dc0',
    pubkey: '0xb4613e8118be0fed1452dff3649a0f8939e20ae8784824ba2f44aebfa6d07a2e3ec19256f96174e0f75d79c2a85789c7',
    signature: '0xb724960e541776c0e8f2c1bd34672246323399fdc5a762d222c3052e0a66e1ad3bcc366e664b8acc4e6b856fea3b2d8f0adb111857de0138209af9622b6ad578e3461f20d904f7fdc5112d52b5f5f0656bedbc5b0bb7e7c45a16053d5a1d5bad',
    withdrawal_credentials: '0x008f59210309a30b1f2d56b47cbe8cd2cb3386cedfccd17b2f0c7ab0faeb2b1b'
  }];
  it('Happy path with 1 stakes', async () => {
    const batchDepositInstance = await BatchDeposit.deployed();

    // Setup 1 account.
    const accountOne = accounts[0];

    let amountWei = new web3.utils.BN(web3.utils.toWei(stakes.reduce((a, b) => (a['amount'] + b['amount']), { amount: '0' }), "gwei"));
    await batchDepositInstance.batchDeposit([stakes[0]['pubkey']], [stakes[0]['withdrawal_credentials']], [stakes[0]['signature']], [stakes[0]['deposit_root']], { from: accountOne, value: amountWei });

    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0x0100000000000000", depositCount, "Expected number of deposits incorrect");
  });
  it('Happy path with 100 stakes', async () => {
    const batchDepositInstance = await BatchDeposit.deployed();
    const N = 100;

    const pubkeyArray = fillArray(stakes[0]['pubkey'], N);
    const withdrawalCredentialsArray = fillArray(stakes[0]['withdrawal_credentials'], N);
    const signatureArray = fillArray(stakes[0]['signature'], N);
    const depositRootArray = fillArray(stakes[0]['deposit_root'], N);
    const amountGweiArray = fillArray(stakes[0]['amount'], N);

    const amountWei = new web3.utils.BN(web3.utils.toWei(amountGweiArray.reduce((a, b) => (a.add(new web3.utils.BN(b))), new web3.utils.BN("0")), "gwei"));

    await batchDepositInstance.batchDeposit(pubkeyArray, withdrawalCredentialsArray, signatureArray, depositRootArray, { from: accounts[0], value: amountWei });

    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0x6500000000000000", depositCount, "Expected number of deposits incorrect");
  });
  it('number of input elements too important', async () => {
    const batchDepositInstance = await BatchDeposit.deployed();
    const N = 101;

    const pubkeyArray = fillArray(stakes[0]['pubkey'], N);
    const withdrawalCredentialsArray = fillArray(stakes[0]['withdrawal_credentials'], N);
    const signatureArray = fillArray(stakes[0]['signature'], N);
    const depositRootArray = fillArray(stakes[0]['deposit_root'], N);
    const amountGweiArray = fillArray(stakes[0]['amount'], N);

    const amountWei = new web3.utils.BN(web3.utils.toWei(amountGweiArray.reduce((a, b) => (a.add(new web3.utils.BN(b))), new web3.utils.BN("0")), "gwei"));

    let errRet;
    try {
      await batchDepositInstance.batchDeposit(pubkeyArray, withdrawalCredentialsArray, signatureArray, depositRootArray, { from: accounts[0], value: amountWei });
    } catch (e) {
      errRet = e;
    }

    console.log(errRet);
    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0x6500000000000000", depositCount, "Expected number of deposits incorrect");
  });
  it('number of signatures mismatch the number of public keys', async () => {
  });
  it('number of amounts mismatch the number of public keys', async () => {
  });
  it('number of deposit_data_roots mismatch the number of public keys', async () => {
  });
  it('number of input elements too important', async () => {
  });
  it('number of withdrawal_credentials mismatch the number of public keys', async () => {
  });
  it('number of signatures mismatch the number of public keys', async () => {
  });
  it('number of deposit_data_roots mismatch the number of public keys', async () => {
  });
  it('supplied ether value mismatch the total deposited sum', async () => {
  });
  it('', async () => {
  });
  it('', async () => {
  });
  it('', async () => {
  });
});
