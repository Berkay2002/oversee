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

const reporterSchema = z.object({
  name: z.string().min(1, "Namn är obligatoriskt"),
  description: z.string(),
});

interface ReporterFormProps {
  reporter?: Tables<'reporters'>;
  onSave: (values: z.infer<typeof reporterSchema>) => void;
  children: React.ReactNode;
}

export function ReporterForm({ reporter, onSave, children }: ReporterFormProps) {
  const form = useForm({
    defaultValues: {
      name: reporter?.name ?? "",
      description: reporter?.description ?? "",
    },
    onSubmit: async ({ value }: { value: z.infer<typeof reporterSchema> }) => {
      onSave(value);
    },
    validators: {
      onChange: reporterSchema,
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{reporter ? "Redigera rapportör" : "Ny rapportör"}</DialogTitle>
          <DialogDescription>
            {reporter
              ? "Redigera rapportörinformation."
              : "Skapa en ny rapportör."}
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
          <DialogFooter>
            <Button type="submit">Spara</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
