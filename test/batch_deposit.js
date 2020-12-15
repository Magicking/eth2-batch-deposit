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
  }, {
    amount: '30000000000',
    deposit_root: '0x4c53091136804d742a57bcdcadd13ba3abb75defa43ea5a5a1fe260821a61b44',
    pubkey: '0x99554ef4974114d4d7c02512967a318cd38ab6e9bd8527a5ccba43ecc2b4c3c40fc2f9cf5417d9432c056be7519d42cd',
    signature: '0x8e8a7b25066701a3ed05387fda023cf17864ad6b4c60717237f580206154878a0457099ece568fff0bd4a72e029ecfb005ccee191b315be6560afdba92ca281e14550d884c249dd4531e851783cd9320687b04e009eadb52c21015ae5eee6aff',
    withdrawal_credentials: '0x005461621dfb509cc6cf4e9307970327a1dd12ddc5641f327241ddc89747681e'
  }];
  it('batchDeposit: Happy path with 1 stakes', async () => {
    const batchDepositInstance = await BatchDeposit.deployed();

    // Setup 1 account.
    const accountOne = accounts[0];

    let amountWei = new web3.utils.BN(web3.utils.toWei(stakes[0]['amount'], "gwei"));
    await batchDepositInstance.batchDeposit([stakes[0]['pubkey']], [stakes[0]['withdrawal_credentials']], [stakes[0]['signature']], [stakes[0]['deposit_root']], { from: accountOne, value: amountWei });

    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0x0100000000000000", depositCount, "Expected number of deposits incorrect");
  });
  it('batchDeposit: Happy path with 100 stakes', async () => {
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
  it('batchDeposit: number of input elements too important', async () => {
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

    assert.equal('number of input elements too important', errRet.reason);
    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0x6500000000000000", depositCount, "Expected number of deposits incorrect");
  });
  it('batchDeposit: number of signatures mismatch the number of public keys', async () => {
    const batchDepositInstance = await BatchDeposit.deployed();
    const N = 2;

    const pubkeyArray = fillArray(stakes[0]['pubkey'], N);
    const withdrawalCredentialsArray = fillArray(stakes[0]['withdrawal_credentials'], N);
    const signatureArray = fillArray(stakes[0]['signature'], N);
    const depositRootArray = fillArray(stakes[0]['deposit_root'], N);
    const amountGweiArray = fillArray(stakes[0]['amount'], N);

    const amountWei = new web3.utils.BN(web3.utils.toWei(amountGweiArray.reduce((a, b) => (a.add(new web3.utils.BN(b))), new web3.utils.BN("0")), "gwei"));
    signatureArray.pop();
    let errRet;
    try {
      await batchDepositInstance.batchDeposit(pubkeyArray, withdrawalCredentialsArray, signatureArray, depositRootArray, { from: accounts[0], value: amountWei });
    } catch (e) {
      errRet = e;
    }

    assert.equal('number of signatures mismatch the number of public keys', errRet.reason);
    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0x6500000000000000", depositCount, "Expected number of deposits incorrect");
  });
  it('batchDeposit: number of deposit_data_roots mismatch the number of public keys', async () => {
    const batchDepositInstance = await BatchDeposit.deployed();
    const N = 2;

    const pubkeyArray = fillArray(stakes[0]['pubkey'], N);
    const withdrawalCredentialsArray = fillArray(stakes[0]['withdrawal_credentials'], N);
    const signatureArray = fillArray(stakes[0]['signature'], N);
    const depositRootArray = fillArray(stakes[0]['deposit_root'], N);
    const amountGweiArray = fillArray(stakes[0]['amount'], N);

    depositRootArray.pop();
    const amountWei = new web3.utils.BN(web3.utils.toWei(amountGweiArray.reduce((a, b) => (a.add(new web3.utils.BN(b))), new web3.utils.BN("0")), "gwei"));
    let errRet;
    try {
      await batchDepositInstance.batchDeposit(pubkeyArray, withdrawalCredentialsArray, signatureArray, depositRootArray, { from: accounts[0], value: amountWei });
    } catch (e) {
      errRet = e;
    }

    assert.equal('number of deposit_data_roots mismatch the number of public keys', errRet.reason);
    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0x6500000000000000", depositCount, "Expected number of deposits incorrect");
  });
  it('batchDepositVariable: number of amounts mismatch the number of public keys', async () => {
    const batchDepositInstance = await BatchDeposit.deployed();
    const N = 2;

    const pubkeyArray = fillArray(stakes[0]['pubkey'], N);
    const withdrawalCredentialsArray = fillArray(stakes[0]['withdrawal_credentials'], N);
    const signatureArray = fillArray(stakes[0]['signature'], N);
    const depositRootArray = fillArray(stakes[0]['deposit_root'], N);
    const amountGweiArray = fillArray(stakes[0]['amount'], N);

    amountGweiArray.pop();
    const amountWei = new web3.utils.BN(web3.utils.toWei(amountGweiArray.reduce((a, b) => (a.add(new web3.utils.BN(b))), new web3.utils.BN("0")), "gwei"));
    let errRet;
    try {
      await batchDepositInstance.batchDepositVariable(pubkeyArray, withdrawalCredentialsArray, signatureArray, depositRootArray, amountGweiArray, { from: accounts[0], value: amountWei });
    } catch (e) {
      errRet = e;
    }

    assert.equal('number of amounts mismatch the number of public keys', errRet.reason);
    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0x6500000000000000", depositCount, "Expected number of deposits incorrect");
  });

  it('batchDepositVariable: Happy path with 100 stakes with a payload different than 32 eth', async () => {
    const batchDepositInstance = await BatchDeposit.deployed();
    const N = 100;

    const pubkeyArray = fillArray(stakes[1]['pubkey'], N);
    const withdrawalCredentialsArray = fillArray(stakes[1]['withdrawal_credentials'], N);
    const signatureArray = fillArray(stakes[1]['signature'], N);
    const depositRootArray = fillArray(stakes[1]['deposit_root'], N);
    const amountGweiArray = fillArray(stakes[1]['amount'], N);

    const amountWei = new web3.utils.BN(web3.utils.toWei(amountGweiArray.reduce((a, b) => (a.add(new web3.utils.BN(b))), new web3.utils.BN("0")), "gwei"));

    await batchDepositInstance.batchDepositVariable(pubkeyArray, withdrawalCredentialsArray, signatureArray, depositRootArray, amountGweiArray, { from: accounts[0], value: amountWei });

    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0xc900000000000000", depositCount, "Expected number of deposits incorrect");
  });
  it('batchDepositVariable: number of input elements too important', async () => {
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
      await batchDepositInstance.batchDepositVariable(pubkeyArray, withdrawalCredentialsArray, signatureArray, depositRootArray, amountGweiArray, { from: accounts[0], value: amountWei });
    } catch (e) {
      errRet = e;
    }

    assert.equal('number of input elements too important', errRet.reason);
    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0xc900000000000000", depositCount, "Expected number of deposits incorrect");
  });
  it('batchDepositVariable: number of withdrawal_credentials mismatch the number of public keys', async () => {
    const batchDepositInstance = await BatchDeposit.deployed();
    const N = 2;

    const pubkeyArray = fillArray(stakes[0]['pubkey'], N);
    const withdrawalCredentialsArray = fillArray(stakes[0]['withdrawal_credentials'], N);
    const signatureArray = fillArray(stakes[0]['signature'], N);
    const depositRootArray = fillArray(stakes[0]['deposit_root'], N);
    const amountGweiArray = fillArray(stakes[0]['amount'], N);

    withdrawalCredentialsArray.pop();
    const amountWei = new web3.utils.BN(web3.utils.toWei(amountGweiArray.reduce((a, b) => (a.add(new web3.utils.BN(b))), new web3.utils.BN("0")), "gwei"));
    let errRet;
    try {
      await batchDepositInstance.batchDepositVariable(pubkeyArray, withdrawalCredentialsArray, signatureArray, depositRootArray, amountGweiArray, { from: accounts[0], value: amountWei });
    } catch (e) {
      errRet = e;
    }

    assert.equal('number of withdrawal_credentials mismatch the number of public keys', errRet.reason);
    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0xc900000000000000", depositCount, "Expected number of deposits incorrect");
  });
  it('batchDepositVariable: number of signatures mismatch the number of public keys', async () => {
    const batchDepositInstance = await BatchDeposit.deployed();
    const N = 2;

    const pubkeyArray = fillArray(stakes[0]['pubkey'], N);
    const withdrawalCredentialsArray = fillArray(stakes[0]['withdrawal_credentials'], N);
    const signatureArray = fillArray(stakes[0]['signature'], N);
    const depositRootArray = fillArray(stakes[0]['deposit_root'], N);
    const amountGweiArray = fillArray(stakes[0]['amount'], N);

    signatureArray.pop();
    const amountWei = new web3.utils.BN(web3.utils.toWei(amountGweiArray.reduce((a, b) => (a.add(new web3.utils.BN(b))), new web3.utils.BN("0")), "gwei"));
    let errRet;
    try {
      await batchDepositInstance.batchDepositVariable(pubkeyArray, withdrawalCredentialsArray, signatureArray, depositRootArray, amountGweiArray, { from: accounts[0], value: amountWei });
    } catch (e) {
      errRet = e;
    }

    assert.equal('number of signatures mismatch the number of public keys', errRet.reason);
    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0xc900000000000000", depositCount, "Expected number of deposits incorrect");
  });
  it('batchDepositVariable: number of deposit_data_roots mismatch the number of public keys', async () => {
    const batchDepositInstance = await BatchDeposit.deployed();
    const N = 2;

    const pubkeyArray = fillArray(stakes[0]['pubkey'], N);
    const withdrawalCredentialsArray = fillArray(stakes[0]['withdrawal_credentials'], N);
    const signatureArray = fillArray(stakes[0]['signature'], N);
    const depositRootArray = fillArray(stakes[0]['deposit_root'], N);
    const amountGweiArray = fillArray(stakes[0]['amount'], N);

    signatureArray.pop();
    const amountWei = new web3.utils.BN(web3.utils.toWei(amountGweiArray.reduce((a, b) => (a.add(new web3.utils.BN(b))), new web3.utils.BN("0")), "gwei"));
    let errRet;
    try {
      await batchDepositInstance.batchDepositVariable(pubkeyArray, withdrawalCredentialsArray, signatureArray, depositRootArray, amountGweiArray, { from: accounts[0], value: amountWei });
    } catch (e) {
      errRet = e;
    }

    assert.equal('number of signatures mismatch the number of public keys', errRet.reason);
    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0xc900000000000000", depositCount, "Expected number of deposits incorrect");
  });
  it('batchDepositVariable: supplied ether value mismatch the total deposited sum', async () => {
    const batchDepositInstance = await BatchDeposit.deployed();
    const N = 2;

    const pubkeyArray = fillArray(stakes[1]['pubkey'], N);
    const withdrawalCredentialsArray = fillArray(stakes[1]['withdrawal_credentials'], N);
    const signatureArray = fillArray(stakes[1]['signature'], N);
    const depositRootArray = fillArray(stakes[1]['deposit_root'], N);
    const amountGweiArray = fillArray(stakes[1]['amount'], N);

    const amountWei = new web3.utils.BN(web3.utils.toWei(amountGweiArray.reduce((a, b) => (a.add(new web3.utils.BN(b))), new web3.utils.BN("42")), "gwei"));
    let errRet;
    try {
      await batchDepositInstance.batchDepositVariable(pubkeyArray, withdrawalCredentialsArray, signatureArray, depositRootArray, amountGweiArray, { from: accounts[0], value: amountWei });
    } catch (e) {
      errRet = e;
    }

    assert.equal('supplied ether value mismatch the total deposited sum', errRet.reason);
    // Get deposit count in big endian.
    const depositCount = await batchDepositInstance.get_deposit_count.call();

    assert.equal("0xc900000000000000", depositCount, "Expected number of deposits incorrect");
  });
});
