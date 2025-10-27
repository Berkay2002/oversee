'use client';

import { useEffect, useState } from 'react';
import {
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { CardContent } from '@/components/ui/card';

export interface PieSlice {
  name: string;
  value: number;
  fill: string;
}

export interface PieChartCustomProps {
  chartConfig: ChartConfig;
  chartData: PieSlice[];
  totalValue: number;
}

// Tailwind 2xl breakpoint watcher
function useIs2xl() {
  const [is2xl, setIs2xl] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1536px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIs2xl(e.matches);
    };

    handler(mq);

    mq.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
    return () => {
      mq.removeEventListener(
        'change',
        handler as (e: MediaQueryListEvent) => void
      );
    };
  }, []);

  return is2xl;
}

export function PieChartCustom({
  chartConfig,
  chartData,
  totalValue,
}: PieChartCustomProps) {
  const is2xl = useIs2xl();

  // Bigger chart for ultrawide
  const outerRadius = is2xl ? 160 : 90;
  const innerRadius = is2xl ? 90 : 50;

  return (
    <div className="flex flex-col 2xl:flex-row 2xl:items-stretch 2xl:gap-6">
      {/* Chart column */}
      <CardContent className="pb-0 2xl:flex-1 2xl:flex 2xl:items-center 2xl:justify-center">
        <ChartContainer
          config={chartConfig}
          className={`
            mx-auto aspect-square max-h-[300px]
            2xl:max-h-[500px] 2xl:w-full
          `}
        >
          {/* Hover group wrapper controls motion */}
          <div
            className="
              group
              flex h-full w-full items-center justify-center
              [transform-origin:center]
              transition-transform duration-300
              hover:translate-y-1 hover:scale-[1.07]
            "
          >
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{name}:</span>
                          <span className="font-bold">{value}</span>
                          <span className="text-muted-foreground text-xs">
                            ({((Number(value) / totalValue) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={outerRadius}
                  innerRadius={innerRadius}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </CardContent>

      {/* Legend column */}
      <CardContent className="pt-4 2xl:pt-0 2xl:flex-1 2xl:flex 2xl:items-center">
        <div
          className={`
            grid w-full gap-3
            grid-cols-1 sm:grid-cols-2
            2xl:grid-cols-1
          `}
        >
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-2 min-w-0"
            >
              <div
                className="h-3 w-3 rounded-sm shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate 2xl:text-sm">
                  {item.name}
                </span>
                <span className="text-xs text-muted-foreground 2xl:text-sm">
                  {item.value} (
                  {((item.value / totalValue) * 100).toFixed(1)}
                  %)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
