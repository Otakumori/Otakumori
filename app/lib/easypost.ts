import { env } from "@/env.mjs";

function auth() { 
  return "Basic " + Buffer.from(env.EASYPOST_API_KEY + ":").toString("base64"); 
}

export const EP = {
  async createShipment(payload: any) {
    const r = await fetch("https://api.easypost.com/v2/shipments", {
      method: "POST",
      headers: { Authorization: auth(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error("EasyPost createShipment failed");
    return r.json();
  },
  async buyShipment(id: string, rateId: string) {
    const r = await fetch(`https://api.easypost.com/v2/shipments/${id}/buy`, {
      method: "POST",
      headers: { Authorization: auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ rate: { id: rateId } }),
    });
    if (!r.ok) throw new Error("EasyPost buyShipment failed");
    return r.json();
  },
};
