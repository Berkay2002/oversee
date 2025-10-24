"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/types/database";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

interface CategoryFormProps {
  category?: Tables<'categories'>;
  onSave: (values: z.infer<typeof categorySchema>) => void;
  children: React.ReactNode;
}

export function CategoryForm({ category, onSave, children }: CategoryFormProps) {
  const form = useForm({
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      color: category?.color ?? "",
    },
    onSubmit: async ({ value }) => {
      onSave(value);
    },
    validatorAdapter: zodValidator,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "New Category"}</DialogTitle>
          <DialogDescription>
            {category
              ? "Edit the category details."
              : "Create a new category."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: categorySchema.shape.name,
            }}
            children={(field) => (
              <div>
                <label htmlFor={field.name}>Name</label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors && (
                  <p className="text-red-500 text-sm">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />
          <form.Field
            name="description"
            validators={{
              onChange: categorySchema.shape.description,
            }}
            children={(field) => (
              <div>
                <label htmlFor={field.name}>Description</label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
          <form.Field
            name="color"
            validators={{
              onChange: categorySchema.shape.color,
            }}
            children={(field) => (
              <div>
                <label htmlFor={field.name}>Color</label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="color"
                />
              </div>
            )}
          />
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
