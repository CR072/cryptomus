import Personal from './src/personal';
import Business from './src/business';
import Market from './src/market';

class Cryptomus {
    constructor(params: any, type: string) {
        if (type === 'personal') {
            return new Personal(params);
        } else if (type === 'business') {
            return new Business(params);
        } else if (type === 'market') {
            return new Market();
        } else {
            throw new Error('Invalid type, use either "personal", "business", or "market".');
        }
    }
}

export default Cryptomus;