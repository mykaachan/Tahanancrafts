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

    // 1️⃣ Fetch order details from Django
    const djangoUrl = `${API}/api/products/orders/get-order-for-booking/${order_id}/`;

    const fetchRes = await fetch(djangoUrl);
    const data = await fetchRes.json();

    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json(data);
    }

    const { delivery } = data;

    const pickupStopId = delivery.pickup_stop_id;
    const dropoffStopId = delivery.dropoff_stop_id;
    const quotationId = delivery.quotation_id;

    // 2️⃣ Prepare PH API order payload
    const payload = {
      data: {
        quotationId: quotationId,
        sender: {
          stopId: pickupStopId
        },
        recipients: [
          {
            stopId: dropoffStopId
          }
        ]
      }
    };

    const bodyStr = JSON.stringify(payload);

    // 3️⃣ Lalamove authentication
    const apiKey = process.env.LALAMOVE_API_KEY;
    const secret = process.env.LALAMOVE_SECRET;

    const timestamp = String(Date.now());
    const path = "/v3/orders";
    const baseUrl = "https://rest.sandbox.lalamove.com";

    const raw = `${timestamp}\r\nPOST\r\n${path}\r\n\r\n${bodyStr}`;
    const signature = crypto.createHmac("sha256", secret)
      .update(raw)
      .digest("hex");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `hmac ${apiKey}:${timestamp}:${signature}`,
      market: "PH"
    };

    // 4️⃣ Send order creation request
    const llmRes = await fetch(baseUrl + path, {
      method: "POST",
      headers,
      body: bodyStr
    });

    const llmData = await llmRes.json();

    if (llmRes.status !== 201) {
      return res.status(llmRes.status).json({
        error: "Lalamove error",
        details: llmData
      });
    }

    return res.status(200).json({ success: true, data: llmData.data });
  } catch (err) {
    console.error("BOOK ORDER ERROR:", err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
