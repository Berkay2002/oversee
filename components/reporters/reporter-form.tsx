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
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { getOrgMembers } from "@/lib/actions/user";
import { useParams } from "next/navigation";
import React from "react";

const reporterSchema = z.object({
  name: z.string().min(1, "Namn är obligatoriskt"),
  description: z.string(),
  user_id: z.string().nullable(),
});

interface ReporterFormProps {
  reporter?: Tables<'reporters'>;
  onSave: (values: z.infer<typeof reporterSchema>) => void;
  children: React.ReactNode;
}

export function ReporterForm({ reporter, onSave, children }: ReporterFormProps) {
  const params = useParams();
  const orgId = params.orgId as string;
  const [orgMembers, setOrgMembers] = React.useState<{ name: string; user_id: string }[]>([]);

  React.useEffect(() => {
    if (orgId) {
      getOrgMembers(orgId).then(setOrgMembers);
    }
  }, [orgId]);

  const form = useForm({
    defaultValues: {
      name: reporter?.name ?? "",
      description: reporter?.description ?? "",
      user_id: reporter?.user_id ?? null,
    },
    onSubmit: async ({ value }: { value: z.infer<typeof reporterSchema> }) => {
      onSave(value);
    },
    validators: {
      onChange: reporterSchema,
    },
  });

  const memberOptions: ComboboxOption[] = orgMembers.map((member) => ({
    value: member.user_id,
    label: member.name,
  }));

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
          <form.Field
            name="user_id"
          >
            {(field) => (
              <div>
                <label htmlFor={field.name}>Kopplad användare</label>
                <Combobox
                  options={memberOptions}
                  value={field.state.value ?? ""}
                  onValueChange={(value) => field.handleChange(value)}
                  placeholder="Välj en användare..."
                  searchPlaceholder="Sök användare..."
                  emptyText="Ingen användare hittades."
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
