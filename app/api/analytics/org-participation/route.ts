import { createClient } from '@/lib/supabase/server';
import { OrgParticipationResponse } from '@/types/org-participation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const orgId = request.nextUrl.searchParams.get('orgId');

  if (!orgId) {
    return NextResponse.json({ error: 'Missing orgId parameter' }, { status: 400 });
  }

  // A. Total members
  const { count: totalMembers, error: totalMembersError } = await supabase
    .from('organization_members')
    .select('user_id', { count: 'exact', head: true })
    .eq('org_id', orgId);

  if (totalMembersError) {
    return NextResponse.json({ error: totalMembersError.message }, { status: 500 });
  }

  // A. Active handlers
  const { data: activeCases, error: activeHandlersError } = await supabase
    .from('vehicle_cases')
    .select('handler_user_id')
    .eq('org_id', orgId)
    .is('archived_at', null)
    .not('handler_user_id', 'is', null);

  if (activeHandlersError) {
    return NextResponse.json({ error: activeHandlersError.message }, { status: 500 });
  }

  const activeHandlersCount = activeCases
    ? new Set(activeCases.map((c) => c.handler_user_id)).size
    : 0;

  const activeHandlerPercent =
    (totalMembers ?? 0) > 0
      ? ((activeHandlersCount ?? 0) / totalMembers!) * 100
      : 0;

  // B. Active cases per handler
  const { data: activeCasesPerHandler, error: activeCasesError } =
    await supabase.rpc('get_active_cases_per_handler', {
      org_id_param: orgId,
    });

  if (activeCasesError) {
    return NextResponse.json({ error: activeCasesError.message }, { status: 500 });
  }

  // C. Skill coverage
  const { data: skillCoverageData, error: skillCoverageError } =
    await supabase.rpc('get_skill_coverage_per_member_with_skills', {
      org_id_param: orgId,
    });

  if (skillCoverageError) {
    return NextResponse.json({ error: skillCoverageError.message }, { status: 500 });
  }

  const skillCoverage = (skillCoverageData || []).map((item) => ({
    userId: item.user_id,
    name: item.name,
    skillCount: item.skill_count,
    skills: item.skills || [],
  }));

  // D. Recent intake per handler
  const { data: recentIntakePerHandler, error: recentIntakeError } =
    await supabase.rpc('get_recent_intake_per_handler', {
      org_id_param: orgId,
    });

  if (recentIntakeError) {
    return NextResponse.json({ error: recentIntakeError.message }, { status: 500 });
  }

  const response: OrgParticipationResponse = {
    totalMembers: totalMembers ?? 0,
    activeHandlersCount: activeHandlersCount ?? 0,
    activeHandlerPercent,
    activeCasesPerHandler: (activeCasesPerHandler || []).map((item) => ({
      userId: item.user_id,
      name: item.name,
      openCaseCount: item.open_case_count,
    })),
    skillCoverage,
    recentIntakePerHandler: (recentIntakePerHandler || []).map((item) => ({
      userId: item.user_id,
      name: item.name,
      newCasesLast30d: item.new_cases_last_30d,
    })),
  };

  return NextResponse.json(response);
}
