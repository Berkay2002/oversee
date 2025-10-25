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

export interface ManadstrendData {
  manad: string;
  rapport_antal: number;
  genomsnitt_dagar: number;
}

export interface ToppRegistreringData {
  registreringsnummer: string;
  antal: number;
  kategorier: string[];
  kategoriFarger: Record<string, string>; // Map of category name to color
}

export async function hamtaInstrumentpanelNyckeltal(): Promise<InstrumentpanelNyckeltal> {
  const supabase = await createClient();

  // Get report statistics
  const { data: reportsData, error: reportsError } = await supabase
    .from('reports')
    .select('days_taken');

  if (reportsError) throw new Error(reportsError.message);

  // Get active categories count
  const { count: categoriesCount, error: categoriesError } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

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

export async function hamtaKategoriFordelning(): Promise<KategoriData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_category_breakdown');

  if (error) {
    // Fallback to manual query if RPC doesn't exist
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, color');

    if (categoriesError) throw new Error(categoriesError.message);

    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .select('category_id');

    if (reportsError) throw new Error(reportsError.message);

    // Count reports per category
    const categoryMap = new Map<string, KategoriData>();

    categoriesData.forEach((cat) => {
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

    reportsData.forEach((report) => {
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

  return data || [];
}

export async function hamtaTeknikerPrestation(): Promise<TeknikerData[]> {
  const supabase = await createClient();

  // Fetch technicians with colors
  const { data: techniciansData, error: techError } = await supabase
    .from('technicians')
    .select('name, color');

  if (techError) throw new Error(techError.message);

  // Create a map of technician names to colors
  const techColorMap = new Map<string, string>();
  techniciansData?.forEach((tech) => {
    techColorMap.set(tech.name, tech.color || '#6366f1');
  });

  const { data, error } = await supabase
    .from('reports')
    .select('technician_name, days_taken');

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

export async function hamtaManadsTrender(): Promise<ManadstrendData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .select('created_at, days_taken')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  // Group by month
  const monthMap = new Map<
    string,
    { count: number; totalDays: number; month: string }
  >();

  data?.forEach((report) => {
    const date = new Date(report.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });

    const existing = monthMap.get(monthKey);
    if (existing) {
      existing.count++;
      existing.totalDays += report.days_taken || 0;
    } else {
      monthMap.set(monthKey, {
        count: 1,
        totalDays: report.days_taken || 0,
        month: monthLabel,
      });
    }
  });

  return Array.from(monthMap.values())
    .map((stats) => ({
      manad: stats.month,
      rapport_antal: stats.count,
      genomsnitt_dagar: Math.round((stats.totalDays / stats.count) * 10) / 10,
    }))
    .sort((a, b) => {
      // Sort chronologically
      const dateA = new Date(a.manad);
      const dateB = new Date(b.manad);
      return dateA.getTime() - dateB.getTime();
    });
}

export async function hamtaToppRegistreringar(): Promise<ToppRegistreringData[]> {
  const supabase = await createClient();

  // First, fetch all categories with colors
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select('name, color');

  if (categoriesError) throw new Error(categoriesError.message);

  // Create a map of category names to colors
  const categoryColorMap: Record<string, string> = {};
  categoriesData?.forEach((cat) => {
    categoryColorMap[cat.name] = cat.color || '#8884d8';
  });
  categoryColorMap['Okategoriserad'] = '#94a3b8';

  const { data, error } = await supabase
    .from('reports')
    .select('registration_numbers, categories(name)');

  if (error) throw new Error(error.message);

  // Flatten and count registration numbers
  const regMap = new Map<string, { count: number; categories: Set<string> }>();

  data?.forEach((report) => {
    const regNumbers = report.registration_numbers || [];
    const categoryName =
      (report.categories as unknown as { name: string } | null)?.name || 'Okategoriserad';

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
