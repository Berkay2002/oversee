import { columns } from "@/components/categories/columns";
import { DataTable } from "@/components/categories/data-table";
import { getCategories, createCategory } from "./actions";
import { CategoryForm } from "@/components/categories/category-form";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ search?: string }>;
}

export default async function CategoriesPage({
  params,
  searchParams,
}: PageProps) {
  const { orgId } = await params;
  const { search } = await searchParams;
  const categories = await getCategories(orgId, { search });

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Kategorier</h1>
        <CategoryForm onSave={(values) => createCategory(orgId, values)}>
          <Button size="sm">Ny kategori</Button>
        </CategoryForm>
      </div>
      <DataTable columns={columns} data={categories} />
    </div>
  );
}
