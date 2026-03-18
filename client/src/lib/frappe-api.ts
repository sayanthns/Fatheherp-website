const FRAPPE_URL = import.meta.env.VITE_FRAPPE_URL ||
  (window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://office.enfonoerp.com');

const BASE = `${FRAPPE_URL}/api/method/fateh_website.api`;

async function call<T = any>(method: string, data?: Record<string, any>): Promise<T> {
  const res = await fetch(`${BASE}.${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify(data || {}),
  });
  const json = await res.json();
  return json.message;
}

export const frappeApi = {
  submitLead: (data: {
    lead_name: string;
    business_name: string;
    phone_number: string;
    location: string;
    source?: string;
    email?: string;
    ad_source?: string;
    ad_campaign?: string;
  }) => call("submit_lead", data),

  getTestimonials: () => call<{ success: boolean; testimonials: any[] }>("get_testimonials"),

  getPricing: () => call<{ success: boolean; pricing: any }>("get_pricing"),

  logVisit: (data: {
    path?: string;
    browser?: string;
    source?: string | null;
    campaign?: string | null;
  }) => call("log_visit", data),

  getSettings: () => call<{ success: boolean; settings: { calendlyUrl: string } }>("get_settings"),
};
