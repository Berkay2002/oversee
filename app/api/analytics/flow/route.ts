import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  orgId: z.string().uuid(),
});

type SankeyNode = {
  id: string;
  label: string;
  group: 'location' | 'funding' | 'insurance' | 'resolution';
};

type SankeyLink = {
  source: string;
  target: string;
  value: number;
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const validation = schema.safeParse({
    orgId: searchParams.get('orgId'),
  });

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { orgId } = validation.data;
  const supabase = await createClient();

  const { data: flowData, error } = await supabase.rpc('get_flow_analytics', {
    p_org_id: orgId,
  });

  if (error) {
    console.error('Error calling get_flow_analytics RPC:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flow analytics' },
      { status: 500 }
    );
  }

  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];
  const nodeIds = new Set<string>();

  const addNode = (node: SankeyNode) => {
    if (!nodeIds.has(node.id)) {
      nodes.push(node);
      nodeIds.add(node.id);
    }
  };

  const linkCounts: Record<string, number> = {};

  for (const row of flowData) {
    const locationNode: SankeyNode = {
      id: `location:${row.location}`,
      label: row.location,
      group: 'location',
    };
    addNode(locationNode);

    const fundingNode: SankeyNode = {
      id: `funding:${row.funding}`,
      label: row.funding,
      group: 'funding',
    };
    addNode(fundingNode);

    const insuranceNode: SankeyNode = {
      id: `insurance:${row.insurance}`,
      label: row.insurance,
      group: 'insurance',
    };
    addNode(insuranceNode);

    const resolutionNode: SankeyNode = {
      id: `resolution:${row.resolution}`,
      label: row.resolution,
      group: 'resolution',
    };
    addNode(resolutionNode);

    // Increment link counts
    const link1 = `${locationNode.id} -> ${fundingNode.id}`;
    const link2 = `${fundingNode.id} -> ${insuranceNode.id}`;
    const link3 = `${insuranceNode.id} -> ${resolutionNode.id}`;

    linkCounts[link1] = (linkCounts[link1] || 0) + 1;
    linkCounts[link2] = (linkCounts[link2] || 0) + 1;
    linkCounts[link3] = (linkCounts[link3] || 0) + 1;
  }

  for (const [key, value] of Object.entries(linkCounts)) {
    const [source, target] = key.split(' -> ');
    links.push({ source, target, value });
  }

  return NextResponse.json({ nodes, links });
}
