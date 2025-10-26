/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteOrganization } from "@/lib/org/actions";

interface DeleteOrgFormProps {
  orgId: string;
  orgName: string;
}

export function DeleteOrgForm({ orgId, orgName }: DeleteOrgFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteOrganization(orgId);
        toast.success(`Organisationen "${orgName}" har tagits bort.`);
        // Omdirigering hanteras av server-åtgärden
      } catch (error) {
        toast.error("Kunde inte ta bort organisationen.");
      } finally {
        setIsOpen(false);
      }
    });
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Ta bort organisation</CardTitle>
        <CardDescription>
          Denna åtgärd kan inte ångras. Detta kommer permanent att ta bort
          organisationen och all dess data.
        </CardDescription>
      </CardHeader>
      <CardFooter className="border-t border-destructive bg-destructive/5 px-6 py-4">
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isPending}>
              Ta bort organisation
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Är du helt säker?</AlertDialogTitle>
              <AlertDialogDescription>
                Denna åtgärd kan inte ångras. Detta kommer permanent att ta bort
                organisationen <strong>{orgName}</strong> och all dess data från
                våra servrar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Avbryt</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? "Tar bort..." : "Ja, ta bort"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
