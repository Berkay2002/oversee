import { columns } from "@/components/categories/columns";
import { DataTable } from "@/components/categories/data-table";
import { getCategories } from "./actions";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const categories = await getCategories({ search });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Kategorier</h1>
      <DataTable columns={columns} data={categories} />
    </div>
  );
}
