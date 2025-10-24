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
import { Tables } from "@/types/database";

const roleSchema = z.object({
  role: z.enum(["admin", "user"]),
});

interface RoleFormProps {
  user: Tables<'profiles'>;
  onSave: (values: z.infer<typeof roleSchema>) => void;
  children: React.ReactNode;
}

export function RoleForm({ user, onSave, children }: RoleFormProps) {
  const form = useForm({
    defaultValues: {
      role: user.role ?? "user",
    },
    onSubmit: async ({ value }: { value: z.infer<typeof roleSchema> }) => {
      onSave(value);
    },
    validators: {
      onChange: roleSchema,
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Role for {user.name}</DialogTitle>
          <DialogDescription>
            Select the new role for the user.
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
                <label htmlFor={field.name}>Role</label>
                <Select
                  onValueChange={(value) => field.handleChange(value as "admin" | "user")}
                  defaultValue={field.state.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <Button type="submit">Save Role</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
