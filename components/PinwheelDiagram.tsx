'use client';

export default function PinwheelDiagram() {
  const cx = 200;
  const cy = 200;
  const R = 125;   // outer radius
  const r = 68;    // inner radius
  const midR = (R + r) / 2;

  function toRad(deg: number) {
    return (deg * Math.PI) / 180;
  }

  function pt(radius: number, deg: number): [number, number] {
    return [
      cx + radius * Math.cos(toRad(deg)),
      cy + radius * Math.sin(toRad(deg)),
    ];
  }

  function f(n: number): string {
    return n.toFixed(3);
  }

  // Builds a curved arrow blade path.
  // startDeg → endDeg goes clockwise (SVG sweep-flag=1).
  // pullBack reserves the last few degrees for the arrowhead.
  function bladePath(startDeg: number, endDeg: number): string {
    const pullBack = 10;   // degrees reserved for arrowhead
    const arcEnd = endDeg - pullBack;
    const arrowExt = 14;   // how far arrowhead extends beyond outer/inner radii

    const [ox1, oy1] = pt(R, startDeg);
    const [ox2, oy2] = pt(R, arcEnd);
    const [ix2, iy2] = pt(r, arcEnd);
    const [ix1, iy1] = pt(r, startDeg);

    // Arrowhead: base spans outer→inner at arcEnd, tip points forward to endDeg
    const [ahOX, ahOY] = pt(R + arrowExt, arcEnd);
    const [ahTX, ahTY] = pt(midR, endDeg);
    const [ahIX, ahIY] = pt(r - arrowExt, arcEnd);

    const sweep = endDeg - startDeg;
    const largeArc = Math.abs(sweep) > 180 ? 1 : 0;

    return [
      `M ${f(ox1)} ${f(oy1)}`,
      `A ${R} ${R} 0 ${largeArc} 1 ${f(ox2)} ${f(oy2)}`,
      `L ${f(ahOX)} ${f(ahOY)}`,
      `L ${f(ahTX)} ${f(ahTY)}`,
      `L ${f(ahIX)} ${f(ahIY)}`,
      `L ${f(ix2)} ${f(iy2)}`,
      `A ${r} ${r} 0 ${largeArc} 0 ${f(ix1)} ${f(iy1)}`,
      'Z',
    ].join(' ');
  }

  // SVG angle convention: 0°=right, 90°=bottom, 180°=left, 270°=top
  // Each blade spans 110° with a 10° gap between them.
  const segments = [
    { color: '#555555', startDeg: -30, endDeg: 80  },  // dark gray  — top-right
    { color: '#F5A623', startDeg: 90,  endDeg: 200 },  // gold       — left
    { color: '#1B2A4A', startDeg: 210, endDeg: 320 },  // dark navy  — top-left
  ];

  return (
    <div className="flex justify-center py-6">
      <svg
        viewBox="0 0 400 400"
        width="420"
        height="420"
        aria-label="Political risk framework pinwheel diagram"
      >
        {segments.map((seg, i) => (
          <path
            key={i}
            d={bladePath(seg.startDeg, seg.endDeg)}
            fill={seg.color}
          />
        ))}
      </svg>
    </div>
  );
}
