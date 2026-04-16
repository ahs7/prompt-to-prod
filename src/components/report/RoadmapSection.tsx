interface RoadmapSectionProps {
  quickWins: string[];
  roadmap30: string[];
  roadmap90: string[];
}

type TimelineColor = "emerald" | "indigo" | "amber";

const COLOR_MAP: Record<
  TimelineColor,
  { label: string; dot: string; text: string }
> = {
  emerald: {
    label: "text-emerald-400",
    dot: "bg-emerald-400",
    text: "text-slate-300",
  },
  indigo: {
    label: "text-indigo-400",
    dot: "bg-indigo-400",
    text: "text-slate-300",
  },
  amber: {
    label: "text-amber-400",
    dot: "bg-amber-400",
    text: "text-slate-300",
  },
};

function TimelineItem({
  items,
  label,
  color,
}: {
  items: string[];
  label: string;
  color: TimelineColor;
}) {
  if (items.length === 0) return null;
  const c = COLOR_MAP[color];
  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-bold uppercase tracking-wider ${c.label}`}>
        {label}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className={`flex items-start gap-2 text-sm ${c.text}`}>
            <span
              className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${c.dot}`}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RoadmapSection({
  quickWins,
  roadmap30,
  roadmap90,
}: RoadmapSectionProps) {
  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 space-y-8">
      <h2 className="text-lg font-bold text-slate-100">Your Roadmap</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <TimelineItem
          items={quickWins}
          label="7-Day Quick Wins"
          color="emerald"
        />
        <TimelineItem items={roadmap30} label="30-Day Plan" color="indigo" />
        <TimelineItem items={roadmap90} label="90-Day Vision" color="amber" />
      </div>
    </div>
  );
}
