'use server';

import { createClient } from '@/lib/supabase/server';

export interface DashboardKPIs {
  totalReports: number;
  avgDays: number;
  maxDays: number;
  minDays: number;
  activeCategories: number;
}

export interface CategoryData {
  category_id: string | null;
  category_name: string;
  color: string;
  report_count: number;
}

export interface TechnicianData {
  technician_name: string;
  report_count: number;
  avg_days: number;
  color?: string;
}

export interface MonthlyTrendData {
  month: string;
  report_count: number;
  avg_days: number;
}

export interface TopRegistrationData {
  registration_number: string;
  count: number;
  categories: string[];
  categoryColors: Record<string, string>; // Map of category name to color
}

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
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

  const totalReports = reportsData?.length || 0;
  const avgDays =
    totalReports > 0
      ? reportsData.reduce((sum, r) => sum + (r.days_taken || 0), 0) /
        totalReports
      : 0;
  const maxDays =
    totalReports > 0
      ? Math.max(...reportsData.map((r) => r.days_taken || 0))
      : 0;
  const minDays =
    totalReports > 0
      ? Math.min(...reportsData.map((r) => r.days_taken || 0))
      : 0;

  return {
    totalReports,
    avgDays: Math.round(avgDays * 10) / 10,
    maxDays,
    minDays,
    activeCategories: categoriesCount || 0,
  };
}

export async function getCategoryBreakdown(): Promise<CategoryData[]> {
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
    const categoryMap = new Map<string, CategoryData>();

    categoriesData.forEach((cat) => {
      categoryMap.set(cat.id, {
        category_id: cat.id,
        category_name: cat.name,
        color: cat.color || '#8884d8',
        report_count: 0,
      });
    });

    // Add uncategorized
    categoryMap.set('null', {
      category_id: null,
      category_name: 'Uncategorized',
      color: '#94a3b8',
      report_count: 0,
    });

    reportsData.forEach((report) => {
      const categoryId = report.category_id || 'null';
      const existing = categoryMap.get(categoryId);
      if (existing) {
        existing.report_count++;
      }
    });

    return Array.from(categoryMap.values())
      .filter((cat) => cat.report_count > 0)
      .sort((a, b) => b.report_count - a.report_count);
  }

  return data || [];
}

export async function getTechnicianPerformance(): Promise<TechnicianData[]> {
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
      technician_name: name,
      report_count: stats.count,
      avg_days: Math.round((stats.totalDays / stats.count) * 10) / 10,
      color: techColorMap.get(name) || '#6366f1',
    }))
    .sort((a, b) => b.report_count - a.report_count);
}

export async function getMonthlyTrends(): Promise<MonthlyTrendData[]> {
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
      month: stats.month,
      report_count: stats.count,
      avg_days: Math.round((stats.totalDays / stats.count) * 10) / 10,
    }))
    .sort((a, b) => {
      // Sort chronologically
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
}

export async function getTopRegistrations(): Promise<TopRegistrationData[]> {
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
  categoryColorMap['Uncategorized'] = '#94a3b8';

  const { data, error } = await supabase
    .from('reports')
    .select('registration_numbers, categories(name)');

  if (error) throw new Error(error.message);

  // Flatten and count registration numbers
  const regMap = new Map<string, { count: number; categories: Set<string> }>();

  data?.forEach((report) => {
    const regNumbers = report.registration_numbers || [];
    const categoryName =
      (report.categories as unknown as { name: string } | null)?.name || 'Uncategorized';

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
      registration_number: regNum,
      count: stats.count,
      categories: Array.from(stats.categories),
      categoryColors: categoryColorMap,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10
}
