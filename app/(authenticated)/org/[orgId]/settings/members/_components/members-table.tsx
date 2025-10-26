"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrgMember } from "../actions";

interface MembersTableProps {
  data: OrgMember[];
  currentUserId: string;
  canManage: boolean;
}

export function MembersTable({ data, currentUserId, canManage }: MembersTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Namn</TableHead>
            {canManage && <TableHead>Roll</TableHead>}
            <TableHead className="text-right">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((member) => (
            <TableRow key={member.userId}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${member.email}.png`} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.name}
                      {member.userId === currentUserId && " (Du)"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              {canManage && (
                <TableCell>
                  <Badge variant="outline">{member.role}</Badge>
                </TableCell>
              )}
              <TableCell className="text-right">
                {/* Actions dropdown will go here */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
