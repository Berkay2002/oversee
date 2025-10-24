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
import { TopRegistrationData } from '@/app/(authenticated)/oversikt/actions';

export interface TopIssuesProps {
  data: TopRegistrationData[];
}

export function TopIssues({ data }: TopIssuesProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Most Reported Vehicles</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
          No registration data to display
        </CardContent>
      </Card>
    );
  }

  // Helper function to convert hex color to inline styles with opacity
  const getCategoryBadgeStyle = (categoryName: string, item: TopRegistrationData) => {
    const hexColor = item.categoryColors[categoryName] || '#8884d8';

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
        <CardTitle>Most Reported Vehicles</CardTitle>
        <CardDescription>
          Top {data.length} registration numbers by report count
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/50">
                <TableHead className="font-semibold w-[150px] sm:w-auto">
                  <span className="hidden sm:inline">Registration Number</span>
                  <span className="inline sm:hidden">Reg. No</span>
                </TableHead>
                <TableHead className="text-right font-semibold w-[120px] sm:w-auto">
                  <span className="hidden sm:inline">Report Count</span>
                  <span className="inline sm:hidden">Count</span>
                </TableHead>
                <TableHead className="font-semibold">Categories</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow
                  key={item.registration_number}
                  className={`
                    transition-all duration-150
                    hover:bg-muted/50 hover:scale-[1.01]
                    ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}
                  `}
                >
                  <TableCell className="font-mono font-semibold text-sm sm:text-base">
                    {item.registration_number}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className="font-semibold px-3 py-1"
                    >
                      {item.count}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {item.categories.slice(0, 3).map((category, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs font-medium px-2.5 py-0.5 border"
                          style={getCategoryBadgeStyle(category, item)}
                        >
                          {category}
                        </Badge>
                      ))}
                      {item.categories.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs font-medium px-2.5 py-0.5 bg-muted/50"
                        >
                          +{item.categories.length - 3} more
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
