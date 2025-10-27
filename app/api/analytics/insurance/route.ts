import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

  if (!orgId) {
    return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.rpc('get_insurance_analytics', {
      p_org_id: orgId,
    });

    if (error) {
      console.error('Error calling get_insurance_analytics RPC:', error);
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching insurance analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
