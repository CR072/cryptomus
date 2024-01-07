import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import Keyv from '@keyv/sqlite';
import fetch from 'node-fetch';
import crypto from 'crypto';

config();

const app = express();
app.use(express.json());

const db = new Keyv('sqlite://core.sqlite');

const APIKEY: string = process.env.MERCHANT_KEY || '';
const MERCHANTID: string = process.env.MERCHANT_ID || '';

/**
 *--------------------------------------------------------------------------
 * /wallet
 *--------------------------------------------------------------------------
*/
app.get("/api/cryptomus/wallet", async (req: Request, res: Response) => {
  const data = {
    network: req.query.network,
    currency: process.env.DEFAULT_NETWORK,
    to_currency: process.env.NETWORK_TO,
    order_id: req.query.id,
    from_referral_code: 'nk5Yow',
  };

  const bodyData = JSON.stringify(data).replace(/\//mg, "\\/");
  let response = await fetch('https://api.cryptomus.com/v1/wallet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchant': MERCHANTID,
      'sign': crypto.createHash('md5').update(Buffer.from(bodyData).toString('base64') + APIKEY).digest('hex'),
    },
    body: bodyData,
  });

  const resp = await response.json();
  res.json(resp);
});

/**
 *--------------------------------------------------------------------------
 * /wallet/qr
 *--------------------------------------------------------------------------
*/
app.post("/api/cryptomus/wallet/qr", async (req: Request, res: Response) => {
  const data = {
    network: req.body.network,
    currency: process.env.DEFAULT_NETWORK,
    to_currency: process.env.NETWORK_TO,
    order_id: req.body.id,
    wallet_address_uuid: req.body.wallet,
    from_referral_code: 'nk5Yow',
  };

  const bodyData = JSON.stringify(data).replace(/\//mg, "\\/");
  let response = await fetch('https://api.cryptomus.com/v1/wallet/qr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchant': MERCHANTID,
      'sign': crypto.createHash('md5').update(Buffer.from(bodyData).toString('base64') + APIKEY).digest('hex'),
    },
    body: bodyData,
  });

  const resp = await response.json();
  res.json(resp);
});

/**
 *--------------------------------------------------------------------------
 * /payment
 *--------------------------------------------------------------------------
*/
app.post("/api/cryptomus/payment", async (req: Request, res: Response) => {
  let invoiceid = makeid(24);
  const data = {
    amount: req.body.amount,
    currency: process.env.DEFAULT_NETWORK,
    to_currency: process.env.NETWORK_TO,
    order_id: invoiceid,
    lifetime: process.env.LIFESPAN,
    url_return: `${process.env.APP_URL}/pay/${invoiceid}`,
    url_callback: process.env.CALLBACK,
    url_success: `${process.env.APP_URL}/api/cryptomus/close/${invoiceid}`,
    from_referral_code: 'nk5Yow',
  };

  await db.set(invoiceid, { userinfo: req.body.user, product: req.body.product });

  const bodyData = JSON.stringify(data).replace(/\//mg, "\\/");
  let response = await fetch('https://api.cryptomus.com/v1/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchant': MERCHANTID,
      'sign': crypto.createHash('md5').update(Buffer.from(bodyData).toString('base64') + APIKEY).digest('hex'),
    },
    body: bodyData,
  });

  const resp = await response.json();
  let orders = await db.get('orders') ?? [];
  orders.push(resp.result);
  await db.set('orders', orders);
  return res.json({ success: true, redirect: resp.result.url });
});

/**
 *--------------------------------------------------------------------------
 * /payment/qr
 *--------------------------------------------------------------------------
*/
app.post("/api/cryptomus/payment/qr", async (req: Request, res: Response) => {
  const data = {
    network: req.body.network,
    currency: process.env.DEFAULT_NETWORK,
    to_currency: process.env.NETWORK_TO,
    order_id: req.body.id,
    merchant_payment_uuid: req.body.invoice,
    from_referral_code: 'nk5Yow',
  };

  const bodyData = JSON.stringify(data).replace(/\//mg, "\\/");
  let response = await fetch('https://api.cryptomus.com/v1/payment/qr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchant': MERCHANTID,
      'sign': crypto.createHash('md5').update(Buffer.from(bodyData).toString('base64') + APIKEY).digest('hex'),
    },
    body: bodyData,
  });

  const resp = await response.json();
  res.json(resp);
});

/**
*--------------------------------------------------------------------------
* Completing the payment and closing the invoice from our end.
*--------------------------------------------------------------------------
*/
app.get("/api/cryptomus/close/:id", async (req: Request, res: Response) => {
  let id = req.params.id;
  if (!await db.get(id)) {
    return res.json({ success: false, message: "Invalid Invoice!" });
  }

  let dbid = await db.get(id);
  let pid = dbid.product;
  interface Product {
    id: number;
  }
  let products = await db.get('products') ?? [];
  let pr = products.findIndex((product: Product) => product.id == pid);

  // Add the product to the user's account, pr is the product.
  await db.delete(id);
  res.redirect('/success');
});

/**
 *--------------------------------------------------------------------------
 * /services
 *--------------------------------------------------------------------------
*/
app.get("/api/cryptomus/services", async (req: Request, res: Response) => {
  res.json(await db.get('services'));
});

/**
 *--------------------------------------------------------------------------
 * Refreshing services from our end
 *--------------------------------------------------------------------------
*/
app.get("/api/cryptomus/services/refresh", async (req: Request, res: Response) => {
  refresh();
  res.json({ success: true });
});

/**
 *--------------------------------------------------------------------------
 * Caching services list to reduce response time & traffic.
 *--------------------------------------------------------------------------
*/
refresh();

async function refresh() {
  const data = {
    from_referral_code: 'nk5Yow',
  };

  const bodyData = JSON.stringify(data).replace(/\//mg, "\\/");
  let response = await fetch('https://api.cryptomus.com/v1/payment/services', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchant': MERCHANTID,
      'sign': crypto.createHash('md5').update(Buffer.from(bodyData).toString('base64') + APIKEY).digest('hex'),
    },
    body: bodyData,
  });

  let resp = await response.json();
  await db.set('services', resp);
  return resp;
}

function makeid(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  const randomBytes = crypto.randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    const index = randomBytes[i] % charactersLength;
    result += characters.charAt(index);
  }

  return result;
}

app.listen(Number(process.env.APP_PORT), () => {
  console.log(`Test server launched into: ${process.env.APP_URL}`);
});
