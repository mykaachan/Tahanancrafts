// /api/checkout-quotation.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { shipping_address, artisan } = req.body;

    if (!shipping_address || !artisan) {
      return res.status(400).json({
        error: "Missing required fields: shipping_address or artisan",
      });
    }

    // Validate lat/lng
    if (!shipping_address.lat || !shipping_address.lng) {
      return res
        .status(400)
        .json({ error: "Shipping address missing coordinates" });
    }

    if (!artisan.pickup_lat || !artisan.pickup_lng) {
      return res
        .status(400)
        .json({ error: "Artisan missing pickup coordinates" });
    }

    // ENV variables — set inside Vercel Dashboard
    const apiKey = process.env.LALAMOVE_API_KEY;
    const secret = process.env.LALAMOVE_SECRET;

    const path = "/v3/quotations";
    const market = "PH";
    const baseUrl = "https://rest.sandbox.lalamove.com";

    const timestamp = String(Date.now());

    // Schedule 5 minutes ahead
   const scheduleAt = new Date(Date.now() + 15 * 60_000)
    .toISOString()
    .replace(/\.\d{3}Z$/, ".000Z");

    const payload = {
      data: {
        scheduleAt,
        serviceType: "MOTORCYCLE",
        language: "en_PH",
        isRouteOptimized: false,
        specialRequests: [],
        stops: [
          {
            coordinates: {
              lat: String(artisan.pickup_lat),
              lng: String(artisan.pickup_lng),
            },
            address: artisan.pickup_address,
          },
          {
            coordinates: {
              lat: String(shipping_address.lat),
              lng: String(shipping_address.lng),
            },
            address: `${shipping_address.address}, ${shipping_address.barangay}, ${shipping_address.city}`,
          },
        ],
      },
    };

    const bodyStr = JSON.stringify(payload);

    // HMAC Signature
    const raw =
      `${timestamp}\r\nPOST\r\n${path}\r\n\r\n` + bodyStr;
    const signature = crypto
      .createHmac("sha256", secret)
      .update(raw)
      .digest("hex");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `hmac ${apiKey}:${timestamp}:${signature}`,
      market,
    };

    // Request to Lalamove API
    const quotationResponse = await fetch(baseUrl + path, {
      method: "POST",
      headers,
      body: bodyStr,
    });

    const quotationData = await quotationResponse.json();

    if (quotationResponse.status !== 201) {
      return res.status(quotationResponse.status).json({
        error: "Lalamove error",
        details: quotationData,
      });
    }

    return res.status(200).json({
      quotation: quotationData.data,
    });
  } catch (error) {
    console.error("Serverless Error:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
