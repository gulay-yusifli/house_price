import { useState } from "react";
import "./App.css";
import { predict } from "./api";
import { cities } from "./cities";
import FloorPlan from "./FloorPlan";

const SQM_MIN = 45;
const SQM_MAX = 171;

const fmt = new Intl.NumberFormat("az-AZ", { maximumFractionDigits: 0 });

function App() {
  const [city, setCity] = useState("Baku");
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [sqm, setSqm] = useState(90);
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeSqm = (value: number) => {
    if (Number.isNaN(value)) return;
    setSqm(Math.min(SQM_MAX, Math.max(SQM_MIN, value)));
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predict({ bedrooms, bathrooms, sqm, city });
      setPrice(res.priceAZN);
    } catch (err) {
      setPrice(null);
      setError(
        `Proqnoz alınmadı (${err instanceof Error ? err.message : "naməlum xəta"}). ` +
          "ASP.NET API (5220) və FastAPI (8000) işləyir?",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <header className="head">
        <h1>Mənzilin qiymətini öyrən</h1>
        <p>
          Şəhəri, otaq sayını və sahəni seç. Süni intellekt modeli Azərbaycan bazarına əsasən təxmini
          qiyməti AZN ilə hesablayır.
        </p>
      </header>

      <div className="layout">
        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="city">Şəhər</label>
            <select id="city" className="select" value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <fieldset>
              <legend>Yataq otaqlarının sayı</legend>
              <div className="segmented">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n}>
                    <input
                      type="radio"
                      id={`bed-${n}`}
                      name="bedrooms"
                      checked={bedrooms === n}
                      onChange={() => setBedrooms(n)}
                    />
                    <label htmlFor={`bed-${n}`}>{n}</label>
                  </span>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="field">
            <fieldset>
              <legend>Hamamların sayı</legend>
              <div className="segmented">
                {[1, 2, 3].map((n) => (
                  <span key={n}>
                    <input
                      type="radio"
                      id={`bath-${n}`}
                      name="bathrooms"
                      checked={bathrooms === n}
                      onChange={() => setBathrooms(n)}
                    />
                    <label htmlFor={`bath-${n}`}>{n}</label>
                  </span>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="field">
            <label htmlFor="sqm">Sahə (m²)</label>
            <div className="range-row">
              <input
                type="range"
                min={SQM_MIN}
                max={SQM_MAX}
                value={sqm}
                onChange={(e) => changeSqm(Number(e.target.value))}
                aria-label="Sahə slayderi"
              />
              <input
                id="sqm"
                className="number"
                type="number"
                min={SQM_MIN}
                max={SQM_MAX}
                value={sqm}
                onChange={(e) => changeSqm(Number(e.target.value))}
              />
            </div>
            <p className="hint">
              {SQM_MIN}–{SQM_MAX} m² arası
            </p>
          </div>

          <button className="submit" type="submit" disabled={loading}>
            {loading ? "Hesablanır…" : "Qiyməti hesabla"}
          </button>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </form>

        <section className="board" aria-live="polite">
          <FloorPlan bedrooms={bedrooms} bathrooms={bathrooms} sqm={sqm} />
          <p className="caption">
            {city}, {bedrooms} yataq, {bathrooms} hamam
          </p>
          <div className="result">
            {price === null ? (
              <p className="empty">Parametrləri seçib “Qiyməti hesabla” düyməsinə bas.</p>
            ) : (
              <>
                <p className="label">Təxmini qiymət</p>
                <p className="price">
                  {fmt.format(price)}
                  <small>AZN</small>
                </p>
                <p className="per">≈ {fmt.format(price / sqm)} AZN / m²</p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
