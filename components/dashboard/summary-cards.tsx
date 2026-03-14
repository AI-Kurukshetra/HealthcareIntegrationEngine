import { StatCard } from "@/components/dashboard/stat-card";
import type { SummaryCardData } from "@/lib/dashboard/types";

interface SummaryCardsProps {
  cards: SummaryCardData[];
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} label={card.label} value={card.value} description={card.description} />
      ))}
    </section>
  );
}
