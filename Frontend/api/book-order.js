// /api/book-order.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { order, delivery, artisan } = req.body;

    if (!order || !delivery || !artisan) {
      return res.status(400).json({ error: "order, delivery, artisan required" });
    }

    // Normalize phone
    const normalizePhone = (p) => {
      if (!p) return null;
      p = p.trim();
      if (p.startsWith("+63")) return p;
      if (p.startsWith("0")) return "+63" + p.substring(1);
      return "+63" + p;
    };

    const buyerPhone = normalizePhone(order.shipping_phone);
    const senderPhone = normalizePhone(artisan.phone);

    const apiKey = process.env.LALAMOVE_API_KEY;
    const secret = process.env.LALAMOVE_SECRET;

    const path = "/v3/orders";
    const baseUrl = "https://rest.sandbox.lalamove.com";
    const market = "PH";

    const timestamp = String(Date.now());

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
            remarks: "",
            address: {
              displayString: order.shipping_address
            }
          }
        ],

        isPODEnabled: false,
        isRecipientSMSEnabled: true
      }
    };

    const bodyStr = JSON.stringify(payload);

    const raw = `${timestamp}\r\nPOST\r\n${path}\r\n\r\n${bodyStr}`;
    const signature = crypto.createHmac("sha256", secret).update(raw).digest("hex");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `hmac ${apiKey}:${timestamp}:${signature}`,
      market
    };

    const response = await fetch(baseUrl + path, {
      method: "POST",
      headers,
      body: bodyStr
    });

    const responseData = await response.json();

    if (response.status !== 201) {
      return res.status(response.status).json({
        error: "Lalamove error",
        details: responseData
      });
    }

    return res.status(200).json(responseData);

  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
