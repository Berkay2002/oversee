"use client";

import { Sankey, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/utils";
import {
  SANKEY_NODE_COLORS,
  getColorByIndex,
} from "@/lib/colors";

// Helper functions for color manipulation
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const adjustColorForTheme = (hexColor: string, theme: string | undefined) => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor; // fallback to original color

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  if (theme === "light") {
    hsl.l = Math.max(0, hsl.l - 10); // Darken for light theme
  } else {
    // Assuming dark theme
    hsl.l = Math.min(100, hsl.l + 20); // Lighten for dark theme
  }

  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
};

type SankeyNode = {
  id: string;
  label: string;
  group: string;
};

type SankeyLink = {
  source: string;
  target: string;
  value: number;
};

type SankeyData = {
  nodes: SankeyNode[];
  links: SankeyLink[];
};

type BilkollenCaseFlowSankeyProps = {
  orgId: string;
};

export function BilkollenCaseFlowSankey({
  orgId,
}: BilkollenCaseFlowSankeyProps) {
  const { theme } = useTheme();
  const { data } = useSuspenseQuery<SankeyData>({
    queryKey: ["flow", orgId],
    queryFn: () => fetcher(`/api/analytics/flow?orgId=${orgId}`),
  });

  const { nodes, links } = useMemo(() => {
    if (!data) return { nodes: [], links: [] };

    const indexedNodes = data.nodes.map((n: SankeyNode, idx: number) => ({
      ...n,
      index: idx,
      name: n.label,
      color: SANKEY_NODE_COLORS[n.label] ?? getColorByIndex(idx),
    }));

    const nodeIndexMap = Object.fromEntries(
      indexedNodes.map((n) => [n.id, n.index])
    );

    const indexedLinks = data.links.map((l: SankeyLink) => ({
      source: nodeIndexMap[l.source],
      target: nodeIndexMap[l.target],
      value: l.value,
    }));

    return { nodes: indexedNodes, links: indexedLinks };
  }, [data]);

  if (!data || data.nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flöde genom processen</CardTitle>
          <CardDescription>
            Visualisering av hur ärenden rör sig genom de olika stegen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Ingen data att visa.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flöde genom processen</CardTitle>
        <CardDescription>
          Visualisering av hur ärenden rör sig genom de olika stegen.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={{ nodes, links }}
            nodePadding={50}
            margin={{
              left: 100,
              right: 100,
              top: 5,
              bottom: 5,
            }}
            node={({ x, y, width, height, index, payload, containerWidth }) => {
              const isOut = x + width + 6 > containerWidth;
              return (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={payload.color}
                    stroke={theme === "dark" ? "hsl(0 0% 9%)" : "hsl(0 0% 100%)"}
                  />
                  <text
                    x={isOut ? x - 6 : x + width + 6}
                    y={y + height / 2}
                    textAnchor={isOut ? "end" : "start"}
                    dominantBaseline="middle"
                    fill={
                      theme === "dark"
                        ? "hsl(0 0% 98%)"
                        : "hsl(240 10% 3.9%)"
                    }
                  >
                    {payload.name}
                  </text>
                </g>
              );
            }}
            link={({
              sourceX,
              sourceY,
              sourceControlX,
              targetX,
              targetY,
              targetControlX,
              linkWidth,
              payload,
            }) => {
              const strokeColor = adjustColorForTheme(
                payload.source.color,
                theme
              );
              return (
                <path
                  d={`M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeOpacity={0.7}
                  strokeWidth={linkWidth}
                />
              );
            }}
          >
            <Tooltip />
          </Sankey>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
