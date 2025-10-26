"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface InviteMemberButtonProps {
  orgId: string;
}

export function InviteMemberButton({ orgId }: InviteMemberButtonProps) {
  const handleClick = () => {
    // TODO: Implement invitation dialog
    console.log("Invite member to org:", orgId);
  };

  return (
    <Button onClick={handleClick}>
      <PlusCircle className="mr-2 h-4 w-4" />
      Bjud in medlem
    </Button>
  );
}
