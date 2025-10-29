'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartBarVertical } from '@/components/chart-bar-vertical';
import { getHandlerColor } from '@/lib/colors';

export function BilkollenHandlerStatsDemo() {
  const allHandlerIds = ['user1', 'user2', 'user3'];
  const handlerStatsData = [
    {
      id: 'user1',
      name: 'Anna Andersson',
      fill: getHandlerColor('user1', allHandlerIds),
      total: 120,
      ongoing: 20,
      completed: 100,
      completionRate: 83,
    },
    {
      id: 'user2',
      name: 'Bo Berglund',
      fill: getHandlerColor('user2', allHandlerIds),
      total: 95,
      ongoing: 15,
      completed: 80,
      completionRate: 84,
    },
    {
      id: 'user3',
      name: 'Cecilia Carlsson',
      fill: getHandlerColor('user3', allHandlerIds),
      total: 80,
      ongoing: 10,
      completed: 70,
      completionRate: 88,
    },
  ];

  return (
    <div className="relative my-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  {handlerStatsData.map((stat) => (
                    <tr key={stat.id || stat.name} className="border-b">
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: getHandlerColor(
                                stat.id || '',
                                allHandlerIds
                              ),
                            }}
                          />
                          {stat.name}
                        </div>
                      </td>
                      <td className="text-right py-2 px-4">{stat.total}</td>
                      <td className="text-right py-2 px-4">{stat.ongoing}</td>
                      <td className="text-right py-2 px-4">{stat.completed}</td>
                      <td className="text-right py-2 px-4">
                        {stat.completionRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Totala ärender per handläggare</CardTitle>
            <CardDescription>
              Totalt antal ärenden för varje handläggare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartBarVertical
              data={handlerStatsData}
              dataKey="total"
              categoryKey="name"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
