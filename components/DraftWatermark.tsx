export default function DraftWatermark() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="text-[120px] md:text-[180px] font-bold text-navy/[0.04] dark:text-cream/[0.04] whitespace-nowrap select-none"
        style={{ transform: 'rotate(-35deg)' }}
      >
        INTERNAL DRAFT
      </div>
    </div>
  );
}
