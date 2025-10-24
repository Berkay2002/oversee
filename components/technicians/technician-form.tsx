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

const technicianSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
});

interface TechnicianFormProps {
  technician?: Tables<'technicians'>;
  onSave: (values: z.infer<typeof technicianSchema>) => void;
  children: React.ReactNode;
}

export function TechnicianForm({ technician, onSave, children }: TechnicianFormProps) {
  const form = useForm({
    defaultValues: {
      name: technician?.name ?? "",
      description: technician?.description ?? "",
      color: technician?.color ?? "#6366f1",
    },
    onSubmit: async ({ value }: { value: z.infer<typeof technicianSchema> }) => {
      onSave(value);
    },
    validators: {
      onChange: technicianSchema,
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{technician ? "Edit Technician" : "New Technician"}</DialogTitle>
          <DialogDescription>
            {technician
              ? "Edit the technician details."
              : "Create a new technician."}
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
          </form.Field>
          <form.Field
            name="color"
          >
            {(field) => (
              <div>
                <label htmlFor={field.name}>Color</label>
                <div className="flex items-center gap-3">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="color"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        field.handleChange(value);
                      }
                    }}
                    onBlur={field.handleBlur}
                    placeholder="#6366f1"
                    className="font-mono flex-1"
                  />
                </div>
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
          </form.Field>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
