"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeightLog } from "@/types";

export type Range = "all" | "1y" | "6m" | "1m" | "1w";

interface WeightChartProps {
  logs: WeightLog[];
  range: Range;
  offset: number;
  allTimeAvg: number | null;
}

type ChartPoint = {
  x: number;
  y: number | null;
  date: string;
};

function parseLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function endOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
}

function formatMonthDay(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function formatMonthShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short" });
}

// Returns the calendar-aligned start/end for a given range and offset.
// offset=0 is the current period, offset=1 is one period back, etc.
export function getPeriodBounds(
  range: Exclude<Range, "all">,
  offset: number
): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (range === "1w") {
    const thisSunday = new Date(today);
    thisSunday.setDate(today.getDate() - today.getDay());
    const start = new Date(thisSunday);
    start.setDate(thisSunday.getDate() - offset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }

  if (range === "1m") {
    // Calendar months: 1st to last day
    const start = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    return { start, end };
  }

  if (range === "6m") {
    // Calendar half-years: Jan–Jun or Jul–Dec
    const currentHalfStartMonth = today.getMonth() < 6 ? 0 : 6;
    const start = new Date(today.getFullYear(), currentHalfStartMonth - offset * 6, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 6, 0);
    return { start, end };
  }

  // 1y: calendar years
  const year = today.getFullYear() - offset;
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  return { start, end };
}

export function getPeriodLabel(range: Exclude<Range, "all">, offset: number): string {
  const { start, end } = getPeriodBounds(range, offset);

  if (range === "1w") {
    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();

    if (sameMonth) {
      return `${formatMonthDay(start)} - ${end.getDate()}, ${end.getFullYear()}`;
    }

    if (sameYear) {
      return `${formatMonthDay(start)} - ${formatMonthDay(end)}, ${end.getFullYear()}`;
    }

    return `${formatMonthDay(start)}, ${start.getFullYear()} - ${formatMonthDay(end)}, ${end.getFullYear()}`;
  }

  if (range === "1m") {
    return start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  if (range === "6m") {
    const sameYear = start.getFullYear() === end.getFullYear();

    if (sameYear) {
      return `${formatMonthShort(start)} - ${formatMonthShort(end)} ${end.getFullYear()}`;
    }

    return `${formatMonthShort(start)} ${start.getFullYear()} - ${formatMonthShort(end)} ${end.getFullYear()}`;
  }

  // 1y
  return String(start.getFullYear());
}

function getDomain(logs: WeightLog[], range: Range, offset: number): [number, number] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (range === "all") {
    const firstLog = logs.length > 0 ? parseLocal(logs[0].logged_date) : today;
    const startOfFirstMonth = new Date(firstLog.getFullYear(), firstLog.getMonth(), 1);
    const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return [startOfDay(startOfFirstMonth), endOfDay(endOfCurrentMonth)];
  }

  const { start, end } = getPeriodBounds(range, offset);

  if (range === "1w") {
    const dayAfterEnd = new Date(end);
    dayAfterEnd.setDate(end.getDate() + 1);
    return [startOfDay(start), startOfDay(dayAfterEnd)];
  }

  return [startOfDay(start), endOfDay(end)];
}

function getDayTicks(startTs: number, endTs: number): number[] {
  const ticks: number[] = [];
  const cur = new Date(startTs);
  cur.setHours(0, 0, 0, 0);
  while (cur.getTime() < endTs) {
    ticks.push(cur.getTime());
    cur.setDate(cur.getDate() + 1);
  }
  return ticks;
}

function getEveryNDaysTicks(startTs: number, endTs: number, stepDays: number): number[] {
  const ticks: number[] = [];
  const cur = new Date(startTs);
  cur.setHours(0, 0, 0, 0);

  while (cur.getTime() <= endTs) {
    ticks.push(cur.getTime());
    cur.setDate(cur.getDate() + stepDays);
  }

  return ticks;
}

function getMonthTicks(startTs: number, endTs: number, stepMonths = 1): number[] {
  const ticks: number[] = [];
  const start = new Date(startTs);
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cur.getTime() <= endTs) {
    if (cur.getTime() >= startTs) ticks.push(cur.getTime());
    cur.setMonth(cur.getMonth() + stepMonths);
  }

  return ticks;
}

function getMonthViewTicks(startTs: number): number[] {
  return getEveryNDaysTicks(startTs, Number.MAX_SAFE_INTEGER, 7);
}

function getSundayTicks(startTs: number, endTs: number): number[] {
  const ticks: number[] = [];
  const cur = new Date(startTs);
  cur.setHours(0, 0, 0, 0);

  while (cur.getTime() <= endTs) {
    if (cur.getDay() === 0) ticks.push(cur.getTime());
    cur.setDate(cur.getDate() + 1);
  }

  return ticks;
}

function getAllTimeTicks(startTs: number, endTs: number): number[] {
  const monthlyTicks = getMonthTicks(startTs, endTs, 1);

  if (monthlyTicks.length <= 12) {
    return getMonthTicks(startTs, endTs, 2);
  }

  if (monthlyTicks.length <= 24) {
    return getMonthTicks(startTs, endTs, 2);
  }

  return getMonthTicks(startTs, endTs, 6);
}

function getXTicks(domain: [number, number], range: Range): number[] {
  const [start, end] = domain;

  if (range === "1w") return getDayTicks(start, end);
  if (range === "1m") return getEveryNDaysTicks(start, end, 7);
  if (range === "6m") return getMonthTicks(start, end, 1);
  if (range === "1y") return getMonthTicks(start, end, 1);
  if (range === "all") return getAllTimeTicks(start, end);

  return getMonthTicks(start, end, 1);
}

function formatXLabel(ts: number, range: Range): string {
  const d = new Date(ts);

  if (range === "1w") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (range === "1m") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (range === "all") {
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  return d.toLocaleDateString("en-US", { month: "short" });
}

function getYDomain(
  data: { y: number | null }[],
  fallbackCenter: number
): { yMin: number; yMax: number; yTicks: number[] } {
  const weights = data.length > 0 ? data.map((d) => d.y ?? fallbackCenter) : [fallbackCenter];
  const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
  const yMin = Math.round((avg - 40) / 10) * 10;
  const yMax = Math.round((avg + 40) / 10) * 10;
  const yTicks: number[] = [];
  for (let v = yMin; v <= yMax; v += 10) yTicks.push(v);
  return { yMin, yMax, yTicks };
}

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: { date?: string } }>;
}) {
  if (!active || !payload?.length) return null;

  const weight = payload[0]?.value;
  const rawDate = payload[0]?.payload?.date;

  if (weight == null || !rawDate) return null;

  const date = parseLocal(rawDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-black/[0.06] bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] text-neutral-700">{date}</p>
      <p className="text-sm font-semibold text-neutral-900">{weight} lbs</p>
    </div>
  );
}

function YTick(props: Record<string, unknown>) {
  const x = props.x as number;
  const y = props.y as number;
  const value = (props.payload as { value: number } | undefined)?.value;
  if (value == null) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-4}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#625d58"
        fontSize={10}
        style={{ userSelect: "none" }}
      >
        {value} lb
      </text>
    </g>
  );
}

function AngledXTick(props: Record<string, unknown> & { range: Range }) {
  const x = props.x as number;
  const y = props.y as number;
  const value = (props.payload as { value: number } | undefined)?.value;
  if (value == null) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={8}
        textAnchor="end"
        fill="#625d58"
        fontSize={10}
        transform="rotate(-40)"
        style={{ userSelect: "none" }}
      >
        {formatXLabel(value, props.range)}
      </text>
    </g>
  );
}

function MonthXTick(props: Record<string, unknown> & { range: Range }) {
  const x = props.x as number;
  const y = props.y as number;
  const value = (props.payload as { value: number } | undefined)?.value;
  if (value == null) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="middle"
        fill="#625d58"
        fontSize={10}
        style={{ userSelect: "none" }}
      >
        {formatXLabel(value, props.range)}
      </text>
    </g>
  );
}

export function WeightChart({ logs, range, offset, allTimeAvg }: WeightChartProps) {
  const sortedLogs = [...logs].sort((a, b) => a.logged_date.localeCompare(b.logged_date));
  const domain = getDomain(sortedLogs, range, offset);
  const [domainStart, domainEnd] = domain;

  const data: ChartPoint[] = sortedLogs
    .filter((l) => {
      const ts = parseLocal(l.logged_date).getTime();
      return ts >= domainStart && ts < domainEnd;
    })
    .map((l) => ({
      x: parseLocal(l.logged_date).getTime(),
      y: l.weight_lbs,
      date: l.logged_date,
    }));

  const fallbackCenter = allTimeAvg ?? 160;
  const { yMin, yMax, yTicks } = getYDomain(data, fallbackCenter);

  // Recharts skips grid/axis rendering when data is empty.
  // Phantom points at domain boundaries force layout computation.
  const chartData: ChartPoint[] =
    data.length > 0
      ? data
      : [
          { x: domainStart, y: null, date: "" },
          { x: domainEnd, y: null, date: "" },
        ];

  const xTicks = getXTicks(domain, range);

  const xAxisHeight = range === "1w" || range === "1m" || range === "all" ? 56 : 32;
  const xTick =
    range === "1w" || range === "1m" || range === "all"
      ? (props: Record<string, unknown>) => <AngledXTick {...props} range={range} />
      : (props: Record<string, unknown>) => <MonthXTick {...props} range={range} />;
  const showDots = (range === "1w" || range === "1m") && data.length > 0 && data.length <= 60;

  return (
    <div
      className="h-full overflow-hidden select-none"
      onMouseDown={(e) => e.preventDefault()}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 14, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e0dbd5" strokeOpacity={0.7} />
          <XAxis
            dataKey="x"
            type="number"
            scale="time"
            domain={domain}
            ticks={xTicks}
            tick={xTick}
            tickLine={false}
            axisLine={{ stroke: "#e0dbd5", strokeWidth: 1 }}
            interval={0}
            minTickGap={0}
            height={xAxisHeight}
            allowDataOverflow
          />
          <YAxis
            domain={[yMin, yMax]}
            ticks={yTicks}
            tick={(props) => <YTick {...props} />}
            tickLine={false}
            axisLine={false}
            width={52}
            allowDataOverflow
          />
          <Tooltip
            content={<TooltipContent />}
            cursor={{ stroke: "#74A12E", strokeWidth: 1, strokeOpacity: 0.4 }}
          />
          <Line
            dataKey="y"
            stroke="#74A12E"
            strokeWidth={2}
            dot={
              showDots
                ? { r: 3, fill: "#74A12E", stroke: "#fff", strokeWidth: 1 }
                : false
            }
            activeDot={{ r: 5, fill: "#74A12E", stroke: "#fff", strokeWidth: 1.5 }}
            type="monotone"
            isAnimationActive={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}