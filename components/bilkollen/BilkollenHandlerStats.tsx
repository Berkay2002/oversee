'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface HandlerStat {
  handler_name: string | null;
  total: number;
  ongoing: number;
  completed: number;
}

export interface BilkollenHandlerStatsProps {
  data: HandlerStat[];
}

export function BilkollenHandlerStats({ data }: BilkollenHandlerStatsProps) {
  const handlerStatsData = data.map((stat) => ({
    name: stat.handler_name || 'Okänd',
    total: stat.total,
    ongoing: stat.ongoing,
    completed: stat.completed,
    completionRate: stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0,
  }));

  if (handlerStatsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Handläggare</CardTitle>
          <CardDescription>Prestanda per handläggare</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
          Ingen data tillgänglig
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Handläggare</CardTitle>
        <CardDescription>Prestanda per handläggare</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Namn</th>
                <th className="text-right py-2 px-4">Totalt</th>
                <th className="text-right py-2 px-4">Pågående</th>
                <th className="text-right py-2 px-4">Klara</th>
                <th className="text-right py-2 px-4">Slutförandegrad</th>
              </tr>
            </thead>
            <tbody>
              {handlerStatsData.map((stat, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">{stat.name}</td>
                  <td className="text-right py-2 px-4">{stat.total}</td>
                  <td className="text-right py-2 px-4">{stat.ongoing}</td>
                  <td className="text-right py-2 px-4">{stat.completed}</td>
                  <td className="text-right py-2 px-4">{stat.completionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
