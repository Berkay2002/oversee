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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteOrganization } from "@/lib/org/actions";

interface DeleteOrgFormProps {
  orgId: string;
  orgName: string;
}

export function DeleteOrgForm({ orgId, orgName }: DeleteOrgFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

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
      <div className="p-6">
        <CardTitle>Ta bort organisation</CardTitle>
        <CardDescription className="mb-4 mt-1">
          Denna åtgärd kan inte ångras. Detta kommer permanent att ta bort
          organisationen och all dess data.
        </CardDescription>
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
            <div className="grid gap-2">
              <Label htmlFor="org-name-confirmation">
                Skriv <span className="font-semibold text-foreground">{orgName}</span> för att bekräfta.
              </Label>
              <Input
                id="org-name-confirmation"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                disabled={isPending}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Avbryt</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isPending || confirmation !== orgName}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? "Tar bort..." : "Ja, ta bort"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}
