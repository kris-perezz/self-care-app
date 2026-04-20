"use client";

import { useState, useMemo, useEffect } from "react";
import type { WeightLog } from "@/types";
import { WeightChart, type Range, getPeriodBounds, getPeriodLabel } from "./weight-chart";
import { WeightList } from "./weight-list";
import { Card, IconButton } from "@/components/ui";
import { FilterButton } from "@/components/filter-button";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const RANGES: { label: string; value: Range }[] = [
  { label: "week", value: "1w" },
  { label: "month", value: "1m" },
  { label: "6 months", value: "6m" },
  { label: "year", value: "1y" },
  { label: "All", value: "all" },
];

const PAGE_SIZE = 15;

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function WeightSection({ logs }: { logs: WeightLog[] }) {
  const [chartRange, setChartRange] = useState<Range>("1w");
  const [chartOffset, setChartOffset] = useState(0);
  const [listPage, setListPage] = useState(0);

  const chartLogs = useMemo(
    () => [...logs].sort((a, b) => a.logged_date.localeCompare(b.logged_date)),
    [logs]
  );

  const allTimeAvg = useMemo(() => {
    if (chartLogs.length === 0) return null;
    return chartLogs.reduce((s, l) => s + l.weight_lbs, 0) / chartLogs.length;
  }, [chartLogs]);

  function handleRangeChange(range: Range) {
    setChartRange(range);
    setChartOffset(0);
  }

  const canGoForward = chartRange !== "all" && chartOffset > 0;

  const canGoBack = useMemo(() => {
    if (chartRange === "all" || chartLogs.length === 0) return false;
    const { end } = getPeriodBounds(chartRange, chartOffset + 1);
    return fmtDate(end) >= chartLogs[0].logged_date;
  }, [chartRange, chartOffset, chartLogs]);

  const periodLabel = useMemo(() => {
    if (chartRange === "all") return null;
    return getPeriodLabel(chartRange, chartOffset);
  }, [chartRange, chartOffset]);

  const periodAvg = useMemo(() => {
    if (chartLogs.length === 0) return null;

    let filtered: WeightLog[];
    if (chartRange === "all") {
      filtered = chartLogs;
    } else {
      const { start, end } = getPeriodBounds(chartRange, chartOffset);
      filtered = chartLogs.filter(
        (l) => l.logged_date >= fmtDate(start) && l.logged_date <= fmtDate(end)
      );
    }

    if (filtered.length === 0) return null;
    const avg = filtered.reduce((s, l) => s + l.weight_lbs, 0) / filtered.length;
    return { avg, count: filtered.length };
  }, [chartLogs, chartRange, chartOffset]);

  const listLogs = useMemo(() => [...chartLogs].reverse(), [chartLogs]);
  const totalPages = Math.ceil(listLogs.length / PAGE_SIZE);
  const paginated = listLogs.slice(listPage * PAGE_SIZE, (listPage + 1) * PAGE_SIZE);

  useEffect(() => {
    if (totalPages === 0) {
      setListPage(0);
      return;
    }
    setListPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);


  return (
    <div className="space-y-4">
      {/* Range filters */}
      <div className="flex gap-1.5">
        {RANGES.map((r) => (
          <div key={r.value} className="shrink-0">
            <FilterButton active={chartRange === r.value} onClick={() => handleRangeChange(r.value)}>
              {r.label}
            </FilterButton>
          </div>
        ))}
      </div>

      {/* Period navigation — hidden for "all" */}
      {chartRange !== "all" && (
        <div className="flex items-center justify-between px-1">
          <IconButton onClick={() => setChartOffset((o) => o + 1)} disabled={!canGoBack} aria-label="Previous period">
            <CaretLeft size={16} />
          </IconButton>
          <span className="text-small font-medium text-neutral-900">{periodLabel}</span>
          <IconButton onClick={() => setChartOffset((o) => Math.max(0, o - 1))} disabled={!canGoForward} aria-label="Next period">
            <CaretRight size={16} />
          </IconButton>
        </div>
      )}

      {/* Chart card */}
      <Card variant="standard" className="flex h-[33vh] min-h-[200px] flex-col px-2 py-2">
        <div className="min-h-0 flex-1">
          <WeightChart logs={chartLogs} range={chartRange} offset={chartOffset} allTimeAvg={allTimeAvg} />
        </div>

        {periodAvg !== null && (
          <div className="mt-2 flex items-center justify-between px-1 text-tiny">
            <span className="text-neutral-700">Average weight: {periodAvg.avg.toFixed(1)} lbs</span>
            <span className="text-neutral-700/70">
              {periodAvg.count} {periodAvg.count === 1 ? "entry" : "entries"}
            </span>
          </div>
        )}
      </Card>

      {/* List — all logs, paginated, unaffected by chart range */}
      {chartLogs.length > 0 && (
        <div className="space-y-3">
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <IconButton onClick={() => setListPage((p) => Math.max(0, p - 1))} disabled={listPage === 0} aria-label="Previous page">
                <CaretLeft size={16} />
              </IconButton>
              <span className="text-tiny text-neutral-700">
                {listPage + 1} / {totalPages}
              </span>
              <IconButton onClick={() => setListPage((p) => Math.min(totalPages - 1, p + 1))} disabled={listPage === totalPages - 1} aria-label="Next page">
                <CaretRight size={16} />
              </IconButton>
            </div>
          )}
          <WeightList logs={paginated} previousWeight={null} />
        </div>
      )}
    </div>
  );
}