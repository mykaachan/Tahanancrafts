import crypto from "crypto";

// Helper: read raw body if Vercel fails to parse JSON
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;

  // Fix Vercel JSON issue: manually parse if empty
  if (!body || Object.keys(body).length === 0) {
    try {
      const rawBody = await getRawBody(req);
      body = JSON.parse(rawBody);
    } catch (error) {
      return res.status(400).json({
        error: "Invalid JSON body",
        detail: error.message,
      });
    }
  }

  const { order, delivery, artisan } = body;

  if (!order || !delivery || !artisan) {
    return res.status(400).json({
      error: "order, delivery, artisan required",
    });
  }

  try {
    const apiKey = process.env.LALAMOVE_API_KEY;
    const secret = process.env.LALAMOVE_SECRET;

    const path = "/v3/orders";
    const baseUrl = "https://rest.sandbox.lalamove.com";
    const timestamp = String(Date.now());

    // Normalize buyer phone
    let buyerPhone = order.shipping_phone.trim();
    if (buyerPhone.startsWith("0")) buyerPhone = "+63" + buyerPhone.slice(1);
    if (!buyerPhone.startsWith("+63")) buyerPhone = "+63" + buyerPhone;

    const payload = {
      data: {
        quotationId: delivery.quotation_id,
        sender: {
          name: artisan.name,
          phone: artisan.phone,
        },
        recipient: {
          name: order.shipping_name,
          phone: buyerPhone,
        },
        stops: [
          {
            stopId: delivery.pickup_stop_id,
          },
          {
            stopId: delivery.dropoff_stop_id,
          },
        ],
      },
    };

    const bodyStr = JSON.stringify(payload);

    // HMAC Signature
    const rawToSign =
      `${timestamp}\r\nPOST\r\n${path}\r\n\r\n` + bodyStr;

    const signature = crypto
      .createHmac("sha256", secret)
      .update(rawToSign)
      .digest("hex");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `hmac ${apiKey}:${timestamp}:${signature}`,
      market: "PH",
    };

    // Send request
    const bookingResponse = await fetch(baseUrl + path, {
      method: "POST",
      headers,
      body: bodyStr,
    });

    const bookingData = await bookingResponse.json();

    // If Lalamove returned error
    if (bookingResponse.status !== 201) {
      return res.status(bookingResponse.status).json({
        error: "Lalamove error",
        details: bookingData,
      });
    }

    // Success
    return res.status(200).json({
      booking: bookingData.data,
    });

  } catch (error) {
    return res.status(500).json({
      error: "BOOK ORDER ERROR",
      detail: error.message,
    });
  }
}
