import { columns } from "@/components/categories/columns";
import { DataTable } from "@/components/categories/data-table";
import { getCategories } from "./actions";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <DataTable columns={columns} data={categories} />
    </div>
  );
}
