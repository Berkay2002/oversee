'use server';

import { createClient } from '@/lib/supabase/server';

export interface InstrumentpanelNyckeltal {
  totaltAntalRapporter: number;
  genomsnittDagar: number;
  maxDagar: number;
  minDagar: number;
  aktivaKategorier: number;
}

export interface KategoriData {
  kategori_id: string | null;
  kategori_namn: string;
  color: string;
  rapport_antal: number;
}

export interface TeknikerData {
  tekniker_namn: string;
  rapport_antal: number;
  genomsnitt_dagar: number;
  color?: string;
}

export interface DagstrendData {
  dag: string;
  rapport_antal: number;
  genomsnitt_dagar: number;
}

export interface VeckotrendData {
  vecka: string;
  rapport_antal: number;
  genomsnitt_dagar: number;
}

export interface ManadstrendData {
  manad: string;
  rapport_antal: number;
  genomsnitt_dagar: number;
}

export interface ToppRegistreringData {
  registreringsnummer: string;
  antal: number;
  kategorier: string[];
  kategoriFarger: Record<string, string>;
}

export async function hamtaInstrumentpanelNyckeltal(
  orgId: string
): Promise<InstrumentpanelNyckeltal> {
  const supabase = await createClient();

  // Get report statistics filtered by org_id
  const { data: reportsData, error: reportsError } = await supabase
    .from('reports')
    .select('days_taken')
    .eq('org_id', orgId);

  if (reportsError) throw new Error(reportsError.message);

  // Get active categories count for this org
  const { count: categoriesCount, error: categoriesError } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId);

  if (categoriesError) throw new Error(categoriesError.message);

  const totaltAntalRapporter = reportsData?.length || 0;
  const genomsnittDagar =
    totaltAntalRapporter > 0
      ? reportsData.reduce((sum, r) => sum + (r.days_taken || 0), 0) /
        totaltAntalRapporter
      : 0;
  const maxDagar =
    totaltAntalRapporter > 0
      ? Math.max(...reportsData.map((r) => r.days_taken || 0))
      : 0;
  const minDagar =
    totaltAntalRapporter > 0
      ? Math.min(...reportsData.map((r) => r.days_taken || 0))
      : 0;

  return {
    totaltAntalRapporter,
    genomsnittDagar: Math.round(genomsnittDagar * 10) / 10,
    maxDagar,
    minDagar,
    aktivaKategorier: categoriesCount || 0,
  };
}

export async function hamtaKategoriFordelning(
  orgId: string
): Promise<KategoriData[]> {
  const supabase = await createClient();

  // Get categories for this org
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, color')
    .eq('org_id', orgId);

  if (categoriesError) throw new Error(categoriesError.message);

  // Get reports for this org
  const { data: reportsData, error: reportsError } = await supabase
    .from('reports')
    .select('category_id')
    .eq('org_id', orgId);

  if (reportsError) throw new Error(reportsError.message);

  // Count reports per category
  const categoryMap = new Map<string, KategoriData>();

  categoriesData?.forEach((cat) => {
    categoryMap.set(cat.id, {
      kategori_id: cat.id,
      kategori_namn: cat.name,
      color: cat.color || '#8884d8',
      rapport_antal: 0,
    });
  });

  // Add uncategorized
  categoryMap.set('null', {
    kategori_id: null,
    kategori_namn: 'Okategoriserad',
    color: '#94a3b8',
    rapport_antal: 0,
  });

  reportsData?.forEach((report) => {
    const categoryId = report.category_id || 'null';
    const existing = categoryMap.get(categoryId);
    if (existing) {
      existing.rapport_antal++;
    }
  });

  return Array.from(categoryMap.values())
    .filter((cat) => cat.rapport_antal > 0)
    .sort((a, b) => b.rapport_antal - a.rapport_antal);
}

export async function hamtaTeknikerPrestation(
  orgId: string
): Promise<TeknikerData[]> {
  const supabase = await createClient();

  // Fetch technicians with colors for this org
  const { data: techniciansData, error: techError } = await supabase
    .from('technicians')
    .select('name, color')
    .eq('org_id', orgId);

  if (techError) throw new Error(techError.message);

  // Create a map of technician names to colors
  const techColorMap = new Map<string, string>();
  techniciansData?.forEach((tech) => {
    techColorMap.set(tech.name, tech.color || '#6366f1');
  });

  // Get reports for this org
  const { data, error } = await supabase
    .from('reports')
    .select('technician_name, days_taken')
    .eq('org_id', orgId);

  if (error) throw new Error(error.message);

  // Group by technician
  const techMap = new Map<string, { count: number; totalDays: number }>();

  data?.forEach((report) => {
    const name = report.technician_name;
    const existing = techMap.get(name);
    if (existing) {
      existing.count++;
      existing.totalDays += report.days_taken || 0;
    } else {
      techMap.set(name, {
        count: 1,
        totalDays: report.days_taken || 0,
      });
    }
  });

  return Array.from(techMap.entries())
    .map(([name, stats]) => ({
      tekniker_namn: name,
      rapport_antal: stats.count,
      genomsnitt_dagar: Math.round((stats.totalDays / stats.count) * 10) / 10,
      color: techColorMap.get(name) || '#6366f1',
    }))
    .sort((a, b) => b.rapport_antal - a.rapport_antal);
}

export async function hamtaDagstrender(orgId: string): Promise<DagstrendData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .select('created_at, days_taken')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  // Group by day (last 30 days)
  const now = new Date();
  const dayMap = new Map<
    string,
    { count: number; totalDays: number; day: string }
  >();

  // Initialize last 30 weekdays with zero values
  let daysAdded = 0;
  for (let i = 0; daysAdded < 30; i++) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayOfWeek = dayStart.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Sunday is 0, Saturday is 6
      dayStart.setHours(0, 0, 0, 0);
      const dayKey = `${dayStart.getFullYear()}-${String(dayStart.getMonth() + 1).padStart(2, '0')}-${String(dayStart.getDate()).padStart(2, '0')}`;
      dayMap.set(dayKey, {
        count: 0,
        totalDays: 0,
        day: dayKey,
      });
      daysAdded++;
    }
  }

  data?.forEach((report) => {
    const date = new Date(report.created_at);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      const existing = dayMap.get(dayKey);
      if (existing) {
        existing.count++;
        existing.totalDays += report.days_taken || 0;
      }
    }
  });

  return Array.from(dayMap.values())
    .map((stats) => ({
      dag: stats.day,
      rapport_antal: stats.count,
      genomsnitt_dagar: stats.count > 0 ? Math.round((stats.totalDays / stats.count) * 10) / 10 : 0,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.dag);
      const dateB = new Date(b.dag);
      return dateA.getTime() - dateB.getTime();
    });
}

export async function hamtaVeckotrender(orgId: string): Promise<VeckotrendData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .select('created_at, days_taken')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  // Group by week (last 12 weeks)
  const now = new Date();
  const weekMap = new Map<
    string,
    { count: number; totalDays: number; week: string }
  >();

  // Initialize last 12 weeks (starting on Mondays)
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const weekStart = new Date(date.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        count: 0,
        totalDays: 0,
        week: weekKey,
      });
    }
  }

  data?.forEach((report) => {
    const date = new Date(report.created_at);
    const dayOfWeek = date.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const weekStart = new Date(new Date(date).setDate(diff));
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;

      const existing = weekMap.get(weekKey);
      if (existing) {
        existing.count++;
        existing.totalDays += report.days_taken || 0;
      }
    }
  });

  return Array.from(weekMap.values())
    .map((stats) => ({
      vecka: stats.week,
      rapport_antal: stats.count,
      genomsnitt_dagar: stats.count > 0 ? Math.round((stats.totalDays / stats.count) * 10) / 10 : 0,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.vecka);
      const dateB = new Date(b.vecka);
      return dateA.getTime() - dateB.getTime();
    });
}

export async function hamtaManadstrender(orgId: string): Promise<ManadstrendData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .select('created_at, days_taken')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  // Group by month (last 12 months)
  const now = new Date();
  const monthMap = new Map<
    string,
    { count: number; totalDays: number; month: string }
  >();

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(monthKey, {
      count: 0,
      totalDays: 0,
      month: monthKey,
    });
  }

  data?.forEach((report) => {
    const date = new Date(report.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const existing = monthMap.get(monthKey);
    if (existing) {
      existing.count++;
      existing.totalDays += report.days_taken || 0;
    }
  });

  return Array.from(monthMap.values())
    .map((stats) => ({
      manad: stats.month,
      rapport_antal: stats.count,
      genomsnitt_dagar: stats.count > 0 ? Math.round((stats.totalDays / stats.count) * 10) / 10 : 0,
    }))
    .sort((a, b) => {
      return a.manad.localeCompare(b.manad);
    });
}

export async function hamtaToppRegistreringar(
  orgId: string
): Promise<ToppRegistreringData[]> {
  const supabase = await createClient();

  // Fetch categories with colors for this org
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select('name, color')
    .eq('org_id', orgId);

  if (categoriesError) throw new Error(categoriesError.message);

  // Create a map of category names to colors
  const categoryColorMap: Record<string, string> = {};
  categoriesData?.forEach((cat) => {
    categoryColorMap[cat.name] = cat.color || '#8884d8';
  });
  categoryColorMap['Okategoriserad'] = '#94a3b8';

  const { data, error } = await supabase
    .from('reports')
    .select('registration_numbers, categories(name)')
    .eq('org_id', orgId);

  if (error) throw new Error(error.message);

  // Flatten and count registration numbers
  const regMap = new Map<string, { count: number; categories: Set<string> }>();

  data?.forEach((report) => {
    const regNumbers = report.registration_numbers || [];
    const categoryName =
      (report.categories as unknown as { name: string } | null)?.name ||
      'Okategoriserad';

    regNumbers.forEach((regNum: string) => {
      const existing = regMap.get(regNum);
      if (existing) {
        existing.count++;
        existing.categories.add(categoryName);
      } else {
        regMap.set(regNum, {
          count: 1,
          categories: new Set([categoryName]),
        });
      }
    });
  });

  return Array.from(regMap.entries())
    .map(([regNum, stats]) => ({
      registreringsnummer: regNum,
      antal: stats.count,
      kategorier: Array.from(stats.categories),
      kategoriFarger: categoryColorMap,
    }))
    .sort((a, b) => b.antal - a.antal)
    .slice(0, 10); // Top 10
}
