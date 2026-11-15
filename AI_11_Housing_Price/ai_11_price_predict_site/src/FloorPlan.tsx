type Props = {
  bedrooms: number;
  bathrooms: number;
  sqm: number;
};

const MIN_SQM = 45;
const MAX_SQM = 171;

type Room = { x: number; y: number; w: number; h: number; label: string; kind: "bed" | "bath" | "living" };

/** Planı otaq, hamam və sahəyə görə hesablayır. */
function buildRooms(bedrooms: number, bathrooms: number, W: number, H: number): Room[] {
  const rooms: Room[] = [];
  const livingW = W * 0.42;
  rooms.push({ x: 0, y: 0, w: livingW, h: H, label: "Qonaq otağı", kind: "living" });

  const rx = livingW;
  const rw = W - livingW;
  const bathH = bathrooms > 0 ? H * 0.28 : 0;
  const bedH = H - bathH;

  const cols = bedrooms > 2 ? 2 : 1;
  const rows = Math.ceil(bedrooms / cols);
  for (let i = 0; i < bedrooms; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const isLastOdd = cols === 2 && i === bedrooms - 1 && bedrooms % 2 === 1;
    const w = isLastOdd ? rw : rw / cols;
    rooms.push({
      x: rx + c * (rw / cols),
      y: r * (bedH / rows),
      w,
      h: bedH / rows,
      label: `Yataq ${i + 1}`,
      kind: "bed",
    });
  }

  for (let i = 0; i < bathrooms; i++) {
    rooms.push({
      x: rx + i * (rw / bathrooms),
      y: bedH,
      w: rw / bathrooms,
      h: bathH,
      label: "Hamam",
      kind: "bath",
    });
  }
  return rooms;
}

const FILL = { bed: "#d9e8ea", bath: "#f6d9df", living: "#eef3f4" } as const;

export default function FloorPlan({ bedrooms, bathrooms, sqm }: Props) {
  const ratio = Math.min(Math.max((sqm - MIN_SQM) / (MAX_SQM - MIN_SQM), 0), 1);
  const W = 300 + ratio * 260;
  const H = 230;
  const pad = 20;
  const rooms = buildRooms(bedrooms, bathrooms, W, H);

  return (
    <svg
      viewBox={`0 0 ${600 + pad * 2} ${H + pad * 2 + 20}`}
      role="img"
      aria-label={`${bedrooms} yataq otağı, ${bathrooms} hamam, ${sqm} kvadratmetr`}
    >
      <g transform={`translate(${pad} ${pad})`}>
        {rooms.map((r, i) => (
          <g key={`${r.kind}-${i}`}>
            <rect
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              fill={FILL[r.kind]}
              stroke="#0e3b43"
              strokeWidth={3}
              style={{ transition: "all 0.35s ease" }}
            />
            <text
              x={r.x + r.w / 2}
              y={r.y + r.h / 2 + 4}
              textAnchor="middle"
              fontSize={r.kind === "bath" ? 11 : 13}
              fill="#10272e"
              fontFamily="Instrument Sans, sans-serif"
            >
              {r.label}
            </text>
          </g>
        ))}
        <line x1={0} y1={H + 14} x2={W} y2={H + 14} stroke="#c2314b" strokeWidth={2} />
        <line x1={0} y1={H + 8} x2={0} y2={H + 20} stroke="#c2314b" strokeWidth={2} />
        <line x1={W} y1={H + 8} x2={W} y2={H + 20} stroke="#c2314b" strokeWidth={2} />
        <text x={W / 2} y={H + 34} textAnchor="middle" fontSize={13} fill="#c2314b" fontWeight={600}>
          {sqm} m²
        </text>
      </g>
    </svg>
  );
}
