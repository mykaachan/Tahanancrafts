// /api/book-order.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { order } = req.body;

    if (!order) {
      return res.status(400).json({ error: "order required" });
    }

    const delivery = order.delivery;
    if (!delivery) {
      return res.status(400).json({ error: "delivery object missing" });
    }

    // -------------------------
    //  Normalize phone to E.164
    // -------------------------
    function normalizePhone(phone) {
      phone = phone.trim();
      if (phone.startsWith("+63")) return phone;
      if (phone.startsWith("0")) return "+63" + phone.slice(1);
      return phone;
    }

    const buyerPhone = normalizePhone(order.shipping_address.phone);

    // -------------------------
    //  Lalamove API call
    // -------------------------
    const apiKey = process.env.LALAMOVE_API_KEY;
    const secret = process.env.LALAMOVE_SECRET;

    const path = "/v3/orders";
    const baseUrl = "https://rest.sandbox.lalamove.com";
    const market = "PH";

    const timestamp = String(Date.now());

    const payload = {
      data: {
        quotationId: delivery.quotationId,
        sender: {
          stopId: delivery.pickup_stop_id
        },
        recipient: {
          stopId: delivery.drop_stop_id,
          name: order.shipping_address.full_name,
          phone: buyerPhone
        }
      }
    };

    const bodyString = JSON.stringify(payload);

    // HMAC Signature for Lalamove
    const raw =
      `${timestamp}\r\nPOST\r\n${path}\r\n\r\n` + bodyString;

    const signature = crypto
      .createHmac("sha256", secret)
      .update(raw)
      .digest("hex");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `hmac ${apiKey}:${timestamp}:${signature}`,
      market
    };

    const response = await fetch(baseUrl + path, {
      method: "POST",
      headers,
      body: bodyString
    });

    const parsed = await response.json();

    if (response.status !== 201) {
      return res.status(response.status).json(parsed);
    }

    // -------------------------
    //  RETURN EXACT SAME FIELDS
    // -------------------------
    return res.status(201).json(parsed.data);

  } catch (error) {
    console.error("BOOK ORDER API ERROR:", error);
    return res.status(500).json({
      error: "Server error",
      detail: error.message
    });
  }
}
