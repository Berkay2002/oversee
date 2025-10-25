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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Tables } from "@/types/database";

const roleSchema = z.object({
  role: z.enum(["admin", "member", "owner"]),
});

interface RoleFormProps {
  user: Tables<'profiles'> & { role: Database["public"]["Enums"]["org_role"] };
  onSave: (values: z.infer<typeof roleSchema>) => void;
  children: React.ReactNode;
}

export function RoleForm({ user, onSave, children }: RoleFormProps) {
  const form = useForm({
    defaultValues: {
      role: user.role as "admin" | "member" | "owner",
    },
    onSubmit: async ({ value }: { value: z.infer<typeof roleSchema> }) => {
      onSave(value);
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Redigera roll för {user.name}</DialogTitle>
          <DialogDescription>
            Välj den nya rollen för användaren.
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
            name="role"
          >
            {(field) => (
              <div>
                <label htmlFor={field.name}>Roll</label>
                <Select
                  onValueChange={(value) => field.handleChange(value as "admin" | "member" | "owner")}
                  defaultValue={field.state.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj en roll" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Ägare</SelectItem>
                    <SelectItem value="admin">Administratör</SelectItem>
                    <SelectItem value="member">Medlem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <Button type="submit">Spara roll</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
