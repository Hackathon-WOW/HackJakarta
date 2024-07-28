"use client"

import React from 'react'
import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { groupSalesByMonth } from './utils';
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/section/detail-umkm/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from "@/components/section/detail-umkm/chart"

const SalesRevenues = () => {
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
    
    const [monthlySales, setMonthlySales] = useState([]);
    useEffect(() => {
        const dataMonthly = groupSalesByMonth(data);
        setMonthlySales(dataMonthly);
    }, [data]);

    const chartConfig = {
        SalesRevenues: {
          label: "Sales Revenues",
          color: "#0F5132"
        },
    }

    
    return (
        <div className=''>
            <Card>
            <CardHeader>
                <CardTitle>Line Chart - Linear</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                <LineChart
                    accessibilityLayer
                    data={monthlySales}
                    margin={{
                    left: 12,
                    right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                    />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                    dataKey="SalesRevenues"
                    type="linear"
                    stroke="var(--color-SalesRevenues)"
                    strokeWidth={2}
                    dot={false}
                    />
                </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                Showing total for the last 6 months
                </div>
            </CardFooter>
            </Card>
        </div>
    )
}

export default SalesRevenues