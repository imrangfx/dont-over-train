import { Lightbulb } from "lucide-react";

export default function GraphInsightsList({ insights }: { insights: string[] }) {
  if (insights.length === 0) return null;

  return (
    <div className="card-surface p-5">
      <h2 className="text-xl font-semibold">Graph Insights</h2>
      <ul className="mt-4 space-y-3">
        {insights.map((insight) => (
          <li key={insight} className="flex items-start gap-3 text-sm leading-6 text-zinc-300">
            <Lightbulb size={16} className="mt-0.5 shrink-0 text-lime-400" aria-hidden="true" />
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
