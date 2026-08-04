import MidtransClient from 'midtrans-client';

let snap: any;
let core: any;

export function getMidtransSnap() {
  if (!snap) {
    snap = new MidtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });
  }
  return snap;
}

export function getMidtransCore() {
  if (!core) {
    core = new MidtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });
  }
  return core;
}
