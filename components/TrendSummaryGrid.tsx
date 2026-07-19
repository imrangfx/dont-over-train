import { Activity, Calendar, CalendarClock, Gauge, TrendingUp, Trophy } from "lucide-react";
import type { TrendCardKind, TrendSummaryCard } from "@/lib/trendAnalytics";

const ICONS: Record<TrendCardKind, React.ReactNode> = {
  trend: <TrendingUp size={20} />,
  weeklyGrowth: <Activity size={20} />,
  bestMonth: <Trophy size={20} />,
  frequency: <Calendar size={20} />,
  daysBetween: <CalendarClock size={20} />,
  consistency: <Gauge size={20} />,
};

const VALUE_COLOR: Partial<Record<string, string>> = {
  Improving: "text-lime-400",
  Declining: "text-red-400",
  Stable: "text-zinc-300",
};

export default function TrendSummaryGrid({ cards }: { cards: TrendSummaryCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <div key={card.kind} className="card-surface p-4">
          <div className="text-lime-400" aria-hidden="true">
            {ICONS[card.kind]}
          </div>
          <div className={`mt-4 text-xl font-bold ${VALUE_COLOR[card.value] ?? "text-white"}`}>
            {card.value}
          </div>
          <div className="mt-1 text-sm font-medium text-zinc-300">{card.title}</div>
          <div className="mt-1 text-xs leading-5 text-zinc-500">{card.description}</div>
        </div>
      ))}
    </div>
  );
}
