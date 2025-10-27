'use client';

import { useEffect, useState, useLayoutEffect, useRef } from 'react';
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

// Custom hook to measure element size
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}

export function PieChartCustom({
  chartConfig,
  chartData,
  totalValue,
}: PieChartCustomProps) {
  const [chartContainerRef, chartSize] =
    useElementSize<HTMLDivElement>();

  // Make radius dynamic based on container size
  const radius = Math.min(chartSize.width, chartSize.height) / 2;
  const outerRadius = Math.max(0, radius * 0.8); // 80% of available radius
  const innerRadius = Math.max(0, radius * 0.5); // 50% of available radius

  return (
    <div className="flex flex-1 flex-col 3xl:flex-row 3xl:items-center 3xl:gap-6">
      {/* Chart column */}
      <CardContent className="pb-0 3xl:flex-1 3xl:flex 3xl:justify-center">
        <div
          ref={chartContainerRef}
          className={`
            mx-auto aspect-square max-h-[250px]
            3xl:max-h-[500px] w-full
          `}
        >
          <ChartContainer
            config={chartConfig}
            className="h-full w-full"
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
        </div>
      </CardContent>

      {/* Legend column */}
      <CardContent className="pt-4 flex justify-center 3xl:pt-0 3xl:flex-1 3xl:items-center">
        <div
          className={`
            grid gap-3
            grid-cols-1 sm:grid-cols-2
            3xl:grid-cols-1
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
                <span className="text-xs font-medium truncate 3xl:text-sm">
                  {item.name}
                </span>
                <span className="text-xs text-muted-foreground 3xl:text-sm">
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
