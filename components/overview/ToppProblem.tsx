'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ToppRegistreringData } from '@/app/(authenticated)/oversikt/actions';

export interface ToppProblemProps {
  data: ToppRegistreringData[];
}

export function ToppProblem({ data }: ToppProblemProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mest rapporterade fordon</CardTitle>
          <CardDescription>Ingen data tillgänglig</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
          Ingen registreringsdata att visa
        </CardContent>
      </Card>
    );
  }

  // Helper function to convert hex color to inline styles with opacity
  const getCategoryBadgeStyle = (categoryName: string, item: ToppRegistreringData) => {
    const hexColor = item.kategoriFarger[categoryName] || '#8884d8';

    // Convert hex to RGB for opacity control
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
      color: hexColor,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`,
    };
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Mest rapporterade fordon</CardTitle>
        <CardDescription>
          Topp {data.length} registreringsnummer efter antal rapporter
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div>
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b bg-muted/50">
                <TableHead className="font-semibold">
                  <span className="hidden sm:inline">Registreringsnummer</span>
                  <span className="inline sm:hidden">Reg. nr</span>
                </TableHead>
                <TableHead className="text-right font-semibold">
                  <span className="hidden sm:inline">Antal rapporter</span>
                  <span className="inline sm:hidden">Antal</span>
                </TableHead>
                <TableHead className="font-semibold">Kategorier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow
                  key={item.registreringsnummer}
                  className={`
                    transition-all duration-150
                    hover:bg-muted/50
                    ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}
                  `}
                >
                  <TableCell className="font-mono font-semibold text-sm sm:text-base truncate">
                    {item.registreringsnummer}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className="font-semibold px-3 py-1"
                    >
                      {item.antal}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 px-4 min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      {item.kategorier.slice(0, 3).map((category, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs font-medium px-2.5 py-0.5 border"
                          style={getCategoryBadgeStyle(category, item)}
                        >
                          {category}
                        </Badge>
                      ))}
                      {item.kategorier.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs font-medium px-2.5 py-0.5 bg-muted/50"
                        >
                          +{item.kategorier.length - 3} mer
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
