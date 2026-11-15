const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220";

export type PredictIn = {
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  city: string;
};

export type PredictOut = {
  priceAZN: number;
};

export async function predict(data: PredictIn): Promise<PredictOut> {
  const response = await fetch(`${API}/api/AI/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<PredictOut>;
}
