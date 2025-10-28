'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelpCircle, Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AddVehicleDialogDemo() {
  return (
    <div className="my-6 flex items-center justify-center rounded-lg border p-6">
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Lägg till bil (Demo)
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              Lägg till fordon
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="ml-2 h-4 w-4 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Här lägger du till nya fordon i systemet genom att ange
                      deras registreringsnummer.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DialogTitle>
            <DialogDescription>
              Ange registreringsnumret för fordonet du vill lägga till i
              systemet.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="registration-number-demo">
                Registreringsnummer
              </Label>
              <Input
                id="registration-number-demo"
                placeholder="ABC123"
                defaultValue="XYZ789"
                className="uppercase"
                readOnly
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline">
              Avbryt
            </Button>
            <Button type="submit">Lägg till</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
