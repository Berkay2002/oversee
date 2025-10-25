"use client";

import { CategoryForm } from "@/components/categories/category-form";
import { createCategory } from "@/lib/actions/category";

interface CategoryFormWrapperProps {
  orgId: string;
  children: React.ReactNode;
}

export function CategoryFormWrapper({ orgId, children }: CategoryFormWrapperProps) {
  return (
    <CategoryForm onSave={(values) => createCategory(orgId, values)}>
      {children}
    </CategoryForm>
  );
}
