"use client";

import { Sankey, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/utils";
import {
  SANKEY_NODE_COLORS,
  getColorByIndex,
} from "@/lib/colors";

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
                    stroke="#fff"
                  />
                  <text
                    x={isOut ? x - 6 : x + width + 6}
                    y={y + height / 2}
                    textAnchor={isOut ? "end" : "start"}
                    dominantBaseline="middle"
                    fill="#666"
                  >
                    {payload.name}
                  </text>
                </g>
              );
            }}
            link={{ stroke: "#B3B3B3", strokeOpacity: 0.5 }}
          >
            <Tooltip />
          </Sankey>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
