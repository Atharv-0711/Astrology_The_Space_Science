type InfoTableProps = {
  title: string;
  rows: Array<[string, string | number | null | undefined]>;
};

export function InfoTable({ title, rows }: InfoTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="divide-y divide-white/10 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[12rem_1fr] gap-4 px-5 py-3">
            <span className="text-slate-400">{label}</span>
            <span className="font-medium text-slate-100">{formatValue(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return typeof value === "number" ? Number(value.toFixed(4)).toString() : value;
}
