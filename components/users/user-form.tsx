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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Tables } from "@/types/database";

const userSchema = z.object({
  email: z.string().email("Ogiltig e-postadress"),
});

interface UserFormProps {
  onSave: (values: z.infer<typeof userSchema>) => void;
  children: React.ReactNode;
}

export function UserForm({ onSave, children }: UserFormProps) {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }: { value: z.infer<typeof userSchema> }) => {
      onSave(value);
    },
    validators: {
      onChange: userSchema,
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bjud in användare</DialogTitle>
          <DialogDescription>
            Ange e-postadressen till den användare du vill bjuda in.
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
            name="email"
          >
            {(field) => (
              <div>
                <label htmlFor={field.name}>E-post</label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="email"
                />
                {field.state.meta.errors && (
                  <p className="text-red-500 text-sm">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <Button type="submit">Skicka inbjudan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
