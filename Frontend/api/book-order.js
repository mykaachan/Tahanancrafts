import crypto from "crypto";
const API_URL = "https://tahanancrafts.onrender.com"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: "order_id required" });
    }

    // 🔥 1. FETCH ORDER + DELIVERY FROM DJANGO
    const djangoOrderRes = await fetch(
      `${process.env.REACT_APP_API_URL}/api/products/orders/get-order/${order_id}/`
    );

    if (!djangoOrderRes.ok) {
      return res
        .status(djangoOrderRes.status)
        .json(await djangoOrderRes.json());
    }

    const djangoData = await djangoOrderRes.json();
    const order = djangoData.order;
    const delivery = djangoData.delivery;

    if (!delivery || !delivery.quotation_id) {
      return res.status(400).json({
        error: "Delivery quotation missing. Generate quotation first.",
      });
    }

    // 🔥 2. NORMALIZE BUYER PHONE TO E.164
    function normalizePhone(phone) {
      phone = phone.trim();
      if (phone.startsWith("+63")) return phone;
      if (phone.startsWith("0")) return "+63" + phone.substring(1);
      return phone;
    }

    const buyerPhone = normalizePhone(order.shipping_phone);

    // 🔥 3. PREPARE LALAMOVE BOOK PAYLOAD
    const apiKey = process.env.LALAMOVE_API_KEY;
    const secret = process.env.LALAMOVE_SECRET;

    const path = "/v3/orders";
    const url = "https://rest.sandbox.lalamove.com" + path;
    const market = "PH";

    const timestamp = String(Date.now());

    const payload = {
      data: {
        quotationId: delivery.quotation_id,
        sender: {
          stopId: delivery.pickup_stop_id,
        },
        recipients: [
          {
            stopId: delivery.dropoff_stop_id,
            name: order.shipping_name,
            phone: buyerPhone,
          },
        ],
      },
    };

    const bodyStr = JSON.stringify(payload);

    // 🔥 4. HMAC SIGNATURE
    const raw = `${timestamp}\r\nPOST\r\n${path}\r\n\r\n${bodyStr}`;
    const signature = crypto
      .createHmac("sha256", secret)
      .update(raw)
      .digest("hex");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `hmac ${apiKey}:${timestamp}:${signature}`,
      market,
    };

    // 🔥 5. SEND REQUEST TO LALAMOVE
    const lalamoveRes = await fetch(url, {
      method: "POST",
      headers,
      body: bodyStr,
    });

    const lalamoveData = await lalamoveRes.json();

    if (lalamoveRes.status !== 201) {
      return res.status(lalamoveRes.status).json({
        error: "Lalamove error",
        details: lalamoveData,
      });
    }

    // 🔥 6. RETURN SUCCESS
    return res.status(200).json({
      message: "Order booked successfully",
      data: lalamoveData.data,
    });
  } catch (error) {
    console.error("BOOK ORDER ERROR:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
