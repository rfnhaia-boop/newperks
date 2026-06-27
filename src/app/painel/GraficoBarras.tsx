type Item = { label: string; valor: number; sub?: string };

export default function GraficoBarras({
  itens,
  corBarra = "bg-violet-500",
  sufixo = "",
  vazio = "Sem dados ainda",
}: {
  itens: Item[];
  corBarra?: string;
  sufixo?: string;
  vazio?: string;
}) {
  const max = Math.max(1, ...itens.map((i) => i.valor));

  if (itens.length === 0) {
    return <p className="py-6 text-center text-sm text-zinc-500">{vazio}</p>;
  }

  return (
    <div className="space-y-3">
      {itens.map((it, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="w-24 shrink-0 truncate text-sm text-zinc-300" title={it.label}>
            {it.label}
          </div>
          <div className="h-6 flex-1 overflow-hidden rounded-md bg-zinc-800">
            <div
              className={`h-full rounded-md ${corBarra} transition-all`}
              style={{ width: `${Math.max(4, (it.valor / max) * 100)}%` }}
            />
          </div>
          <div className="w-20 shrink-0 text-right text-xs font-semibold text-zinc-300">
            {it.valor}
            {sufixo}
          </div>
        </div>
      ))}
    </div>
  );
}
