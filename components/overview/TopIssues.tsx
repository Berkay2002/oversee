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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Reported Vehicles</CardTitle>
        <CardDescription>
          Top {data.length} registration numbers by report count
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration Number</TableHead>
              <TableHead className="text-right">Report Count</TableHead>
              <TableHead>Categories</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.registration_number}>
                <TableCell className="font-mono font-medium">
                  {item.registration_number}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{item.count}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.categories.slice(0, 3).map((category, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {item.categories.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.categories.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
