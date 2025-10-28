'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

export function InlineEditingDemo() {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border">
      <p className="p-4 text-sm text-muted-foreground">
        Detta är en interaktiv demo. Prova att klicka på fälten nedan för att se hur du kan redigera ett ärende direkt i tabellen.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reg.nr</TableHead>
            <TableHead>Plats</TableHead>
            <TableHead>Kostnadstyp</TableHead>
            <TableHead>Foto</TableHead>
            <TableHead>Räknad på</TableHead>
            <TableHead>Försäkring</TableHead>
            <TableHead>Anteckningar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <div className="font-mono font-semibold uppercase">ABC 123</div>
            </TableCell>
            <TableCell>
              <Select defaultValue="verkstad">
                <SelectTrigger className="h-8 w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verkstad">Verkstad</SelectItem>
                  <SelectItem value="parkering">Parkering</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Select defaultValue="insurance">
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insurance">Försäkring</SelectItem>
                  <SelectItem value="internal">Intern</SelectItem>
                  <SelectItem value="customer">Kund</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Checkbox />
            </TableCell>
            <TableCell>
              <Checkbox defaultChecked />
            </TableCell>
            <TableCell>
              <Select defaultValue="approved">
                <SelectTrigger className="h-8 w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Väntar försäkring</SelectItem>
                  <SelectItem value="approved">Godkänd</SelectItem>
                  <SelectItem value="rejected">Avslagen</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Input
                defaultValue="Repa på dörren"
                className="h-8 w-[200px]"
                placeholder="Lägg till anteckning..."
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
