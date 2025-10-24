"use client";

import { useForm } from "@tanstack/react-form";
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
  name: z.string().min(1, "Namn är obligatoriskt"),
  description: z.string(),
  color: z.string(),
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
    onSubmit: async ({ value }: { value: z.infer<typeof categorySchema> }) => {
      onSave(value);
    },
    validators: {
      onChange: categorySchema,
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Redigera kategori" : "Ny kategori"}</DialogTitle>
          <DialogDescription>
            {category
              ? "Redigera kategoriinformation."
              : "Skapa en ny kategori."}
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
          >
            {(field) => (
              <div>
                <label htmlFor={field.name}>Namn</label>
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
          </form.Field>
          <form.Field
            name="description"
          >
            {(field) => (
              <div>
                <label htmlFor={field.name}>Beskrivning</label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field
            name="color"
          >
            {(field) => (
              <div>
                <label htmlFor={field.name}>Färg</label>
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
          </form.Field>
          <DialogFooter>
            <Button type="submit">Spara</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
