"use client"
import React, { useEffect, useState } from 'react'
import { groupSalesByMonth, revNProfitMargin } from './utils'
import Papa from 'papaparse';
import { Bar, BarChart, LabelList, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart"

const ProfitMargin = () => {
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
    
    const [profitQuantity, setProfitQuantity] = useState([]);
    useEffect(() => {
        const profit = revNProfitMargin(data);
        setProfitQuantity(profit);
    }, [data]);
    const [salesRevenue, setSalesRevenue] = useState([]);
    useEffect(() => {
        const profit = groupSalesByMonth(data);
        setSalesRevenue(profit);
    }, [data]);

    for (let index = 0; index < salesRevenue.length; index++) {
        const element = salesRevenue[index];
        element["Profit"] = profitQuantity[index].Profit
        element["COGS"] = element.SalesRevenues - profitQuantity[index].Profit
    }
    console.log(salesRevenue)
    const chartConfig = {
        Profit: {
          label: "Profit",
          color: "#F7CA52",
        },
        COGS: {
          label: "COGS",
          color: "#0F5132",
        },
        SalesRevenues: {
            label: "Sales Revenue"
        }
      }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tooltip - Default</CardTitle>
        <CardDescription>
          Default tooltip with ChartTooltipContent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={salesRevenue}>
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
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
  )
}

export default ProfitMargin