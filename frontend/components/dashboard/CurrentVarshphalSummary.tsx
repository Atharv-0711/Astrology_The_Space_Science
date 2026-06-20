import type { AnnualHoroscopeInformationBlock } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";

export function CurrentVarshphalSummary({
  block,
  term,
}: {
  block: AnnualHoroscopeInformationBlock;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Varsh Pravesh" value={`${block.varsha_pravesh.exact_varsha_pravesh_date} ${block.varsha_pravesh.exact_varsha_pravesh_time}`} />
      <SummaryCard label="Varsha Lagna" value={block.varsha_pravesh.varsha_lagna} />
      <SummaryCard label="Muntha" value={`${block.muntha.muntha_sign}, House ${block.muntha.muntha_house}`} />
      <div className="rounded-2xl bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">Strongest Planet</p>
        <p className="mt-2 font-semibold text-white">{term("planets", block.strength_analysis.strongest_planet)}</p>
        <div className="mt-3">
          <StatusBadge tone="good">{block.muntha.muntha_strength.toFixed(0)} Muntha</StatusBadge>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}
