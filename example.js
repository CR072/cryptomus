import Cryptomus from 'cryptomus';

const personal = new Cryptomus({ apiKey: '', accountUuid: '' }, 'personal');
const business = new Cryptomus({ paymentKey: '', payoutKey: '', merchantUuid: '' }, 'business');
const market = new Cryptomus({}, 'market');

async function example() {
  console.log(`Market assets: ${await market.getAssets()}`)
}

example()