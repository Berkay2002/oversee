'use client';

import { Car, FileX, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useOrg } from '@/lib/org/context';

type EmptyStateProps = {
  type: 'no-vehicles' | 'no-results' | 'no-locations';
  onAction?: () => void;
  actionLabel?: string;
};

export function EmptyState({ type, onAction, actionLabel }: EmptyStateProps) {
  const { activeOrg } = useOrg();

  const variants = {
    'no-vehicles': {
      icon: Car,
      title: 'Inga fordon ännu',
      description: 'Kom igång genom att lägga till ditt första fordon i systemet.',
      actionLabel: 'Lägg till fordon',
    },
    'no-results': {
      icon: FileX,
      title: 'Inga resultat hittades',
      description:
        'Prova att justera dina sökfilter eller rensa dem för att se alla fordon.',
      actionLabel: 'Rensa filter',
    },
    'no-locations': {
      icon: Package,
      title: 'Inga platser konfigurerade',
      description:
        'Du måste konfigurera minst en plats innan du kan lägga till fordon.',
      actionLabel: 'Gå till Platser',
    },
  };

  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-6 text-lg font-semibold">{variant.title}</h3>
        <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
          {variant.description}
        </p>
        {type === 'no-locations' ? (
          <Button asChild className="mt-6">
            <Link href={`/org/${activeOrg.id}/platser`}>
              {variant.actionLabel}
            </Link>
          </Button>
        ) : onAction && (variant.actionLabel || actionLabel) ? (
          <Button onClick={onAction} className="mt-6">
            {actionLabel || variant.actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
