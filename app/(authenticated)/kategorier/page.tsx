import { columns } from "@/components/categories/columns";
import { DataTable } from "@/components/categories/data-table";
import { getCategories } from "./actions";
import { CategoryForm } from "@/components/categories/category-form";
import { createCategory } from "@/app/(authenticated)/kategorier/actions";
import { Button } from "@/components/ui/button";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const categories = await getCategories({ search });

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Kategorier</h1>
        <CategoryForm onSave={createCategory}>
          <Button size="sm">Ny kategori</Button>
        </CategoryForm>
      </div>
      <DataTable columns={columns} data={categories} />
    </div>
  );
}
