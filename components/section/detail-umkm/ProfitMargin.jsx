"use client";
import React, { useEffect, useState } from 'react';
import { groupSalesByMonth, revNProfitMargin } from './utils';
import { Bar, BarChart, XAxis } from 'recharts';
import Papa from 'papaparse';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';


const ProfitMargin = () => {
  const [salesRevenue, setSalesRevenue] = useState([]);
  const [profitQuantity, setProfitQuantity] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
      const fetchData = async () => {
        const response = await fetch('/Dummy.csv');
        const reader = response.body.getReader();
        const result = await reader.read();
        const decoder = new TextDecoder("utf-8");
        const csvData = decoder.decode(result.value);
        const parsedData = Papa.parse(csvData, { 
          header: true, 
          skipEmptyLines: true 
        }).data;
        setData(parsedData);
      };
      fetchData();
  }, []);
  
  // useEffect(() => {
  //   const sales = groupSalesByMonth(data);
  //   setSalesRevenue(sales);
  //   const profit = revNProfitMargin(data);
  //   setProfitQuantity(profit);
  // }, [data]);

  useEffect(() => {
    const profit = revNProfitMargin(data);
    setProfitQuantity(profit);
  }, [data]);
  

  // useEffect(() => {
  //   const parsedData = Papa.parse("", {
  //     header: true,
  //     skipEmptyLines: true,
  //   }).data;

  //   const profit = revNProfitMargin(parsedData);
  //   setProfitQuantity(profit);

  //   const sales = groupSalesByMonth(parsedData);
  //   setSalesRevenue(sales);
  // }, []);

  useEffect(() => {
    if (salesRevenue.length > 0 && profitQuantity.length > 0) {
      const updatedSalesRevenue = salesRevenue.map((element, index) => ({
        ...element,
        Profit: profitQuantity[index]?.Profit || 0,
        COGS: element.SalesRevenues - (profitQuantity[index]?.Profit || 0),
      }));
      setSalesRevenue(updatedSalesRevenue);
    }
  }, [salesRevenue, profitQuantity]);

  console.log(data)
  console.log(salesRevenue)
  console.log(profitQuantity)

  const chartConfig = {
    Profit: {
      label: 'Profit',
      color: '#F7CA52',
    },
    COGS: {
      label: 'COGS',
      color: '#0F5132',
    },
    SalesRevenues: {
      label: 'Sales Revenue',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue and Profit Margins</CardTitle>
        <CardDescription>
          Evaluate revenue generation and profit margins over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={salesRevenue}>
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <Bar
              dataKey="Profit"
              stackId="a"
              fill="var(--color-Profit)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="COGS"
              stackId="a"
              fill="var(--color-COGS)"
              radius={[0, 0, 4, 4]}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ProfitMargin;