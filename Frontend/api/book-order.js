// /api/book-order.js
import crypto from "crypto";

const API = "https://tahanancrafts.onrender.com"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: "order_id required" });
    }

    // 1️⃣ FETCH ORDER DETAILS FROM YOUR DJANGO BACKEND
    const djangoUrl = `${API}/api/products/orders/get-order/${order_id}/`;

    const fetchRes = await fetch(djangoUrl);
    const fetchData = await fetchRes.json();

    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json(fetchData);
    }

    const { order, delivery, artisan } = fetchData;

    if (!order || !delivery || !artisan) {
      return res.status(400).json({ error: "Invalid Django response" });
    }

    // Normalize phone
    const buyerPhone = normalizePhone(order.shipping_phone);
    const senderPhone = normalizePhone(artisan.phone);

    // 2️⃣ PREPARE LALAMOVE ORDER
    const apiKey = process.env.LALAMOVE_API_KEY;
    const secret = process.env.LALAMOVE_SECRET;

    const baseUrl = "https://rest.sandbox.lalamove.com";
    const timestamp = String(Date.now());
    const path = "/v3/orders";

    const payload = {
      data: {
        quotationId: delivery.quotation_id,
        sender: {
          name: artisan.name,
          phone: senderPhone
        },
        recipients: [
          {
            name: order.shipping_name,
            phone: buyerPhone,
            stops: [
              { stopId: delivery.dropoff_stop_id }
            ]
          }
        ],
        items: [],
        deliverySequence: "SEQUENTIAL"
      }
    };

    const bodyStr = JSON.stringify(payload);

    // 3️⃣ SIGNATURE
    const raw = `${timestamp}\r\nPOST\r\n${path}\r\n\r\n${bodyStr}`;
    const signature = crypto.createHmac("sha256", secret).update(raw).digest("hex");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `hmac ${apiKey}:${timestamp}:${signature}`,
      market: "PH"
    };

    // 4️⃣ SEND BOOKING REQUEST TO LALAMOVE
    const llmRes = await fetch(baseUrl + path, {
      method: "POST",
      headers,
      body: bodyStr,
    });

    const llmData = await llmRes.json();

    if (llmRes.status !== 201) {
      return res.status(llmRes.status).json({ error: "Lalamove error", details: llmData });
    }

    // 5️⃣ RETURN SUCCESS
    return res.status(200).json({
      message: "Lalamove booking successful",
      data: llmData.data
    });

  } catch (err) {
    console.error("BOOK ORDER ERROR:", err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}

function normalizePhone(phone) {
  if (!phone) return "";
  phone = phone.trim();
  if (phone.startsWith("+63")) return phone;
  if (phone.startsWith("0")) return "+63" + phone.slice(1);
  return "+63" + phone;
}
