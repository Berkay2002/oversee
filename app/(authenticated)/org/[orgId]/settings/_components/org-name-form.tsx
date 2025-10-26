/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { updateOrganizationName } from "@/lib/org/actions";
import { useTransition } from "react";

const orgNameSchema = z.object({
  name: z.string().min(2, "Namnet måste vara minst 2 tecken."),
});

type OrgNameFormValues = z.infer<typeof orgNameSchema>;

interface OrgNameFormProps {
  orgId: string;
  orgName: string;
  disabled: boolean;
}

export function OrgNameForm({ orgId, orgName, disabled }: OrgNameFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<OrgNameFormValues>({
    resolver: zodResolver(orgNameSchema),
    defaultValues: {
      name: orgName,
    },
  });

  const onSubmit = (data: OrgNameFormValues) => {
    startTransition(async () => {
      try {
        await updateOrganizationName(orgId, data.name);
        toast.success("Organisationens namn har uppdaterats.");
      } catch (error) {
        toast.error("Kunde inte uppdatera organisationens namn.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organisationsnamn</CardTitle>
        <CardDescription>
          Detta är namnet på din organisation.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Namn</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={disabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={disabled || isPending}>
              {isPending ? "Sparar..." : "Spara"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
