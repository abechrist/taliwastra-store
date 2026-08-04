import { NextRequest, NextResponse } from 'next/server';
import { getMidtransSnap } from '@/lib/config/midtrans';
import { createOrder, getOrderByNumber, listOrders, updateMidtransUrls } from '@/lib/db/repositories/orders';
import { CART_SESSION_COOKIE } from '@/lib/cart/session';

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(CART_SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'Keranjang belanja kosong' }, { status: 400 });
    }

    const body = await req.json();
    const {
      customer_name, customer_email, customer_phone,
      shipping_address, shipping_city, shipping_postal_code,
      shipping_courier, shipping_service, shipping_cost,
      payment_method,
    } = body;

    if (!customer_name || !customer_email || !shipping_address || !shipping_city) {
      return NextResponse.json({ success: false, message: 'Data pemesan tidak lengkap' }, { status: 400 });
    }

    const result = await createOrder(sessionId, {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_postal_code,
      shipping_courier,
      shipping_service,
      shipping_cost,
      payment_method,
    });

    if (!result.ok) {
      return NextResponse.json({ success: false, message: 'Keranjang belanja kosong' }, { status: 400 });
    }

    const { order, items } = result;
    const total = Number(order.total);

    if (payment_method === 'midtrans') {
      try {
        const snap = getMidtransSnap();
        const midtransParam = {
          transaction_details: {
            order_id: order.order_number,
            gross_amount: total,
          },
          customer_details: {
            first_name: customer_name,
            email: customer_email,
            phone: customer_phone,
            shipping_address: {
              first_name: customer_name,
              address: shipping_address,
              city: shipping_city,
              postal_code: shipping_postal_code,
            },
          },
          item_details: items.map((item) => ({
            id: item.product_id,
            price: Number(item.price),
            quantity: item.quantity,
            name: item.name,
          })),
        };

        const midtransResponse = await snap.createTransaction(midtransParam);

        await updateMidtransUrls(order.id, {
          transactionId: midtransResponse.transaction_id || null,
          redirectUrl: midtransResponse.redirect_url || null,
        });

        return NextResponse.json({
          success: true,
          data: {
            ...order,
            midtrans_redirect_url: midtransResponse.redirect_url,
            midtrans_token: midtransResponse.token,
          },
        });
      } catch (midtransErr) {
        console.error('Midtrans error:', midtransErr);
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    console.error('createOrder error:', err);
    return NextResponse.json({ success: false, message: 'Gagal membuat pesanan' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('order_number');
    const customerEmail = searchParams.get('customer_email');

    if (orderNumber) {
      const order = await getOrderByNumber(orderNumber);
      if (!order) {
        return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: order });
    }

    const orders = await listOrders(customerEmail || undefined);
    return NextResponse.json({ success: true, data: orders });
  } catch (err) {
    console.error('getOrders error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil pesanan' }, { status: 500 });
  }
}
