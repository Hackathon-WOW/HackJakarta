<<<<<<< HEAD
"use client"
import React, { useEffect, useState } from 'react'
import { groupSalesByMonth, revNProfitMargin } from './utils'
import Papa from 'papaparse';
import { Bar, BarChart, LabelList, XAxis } from "recharts"
=======
"use client";
import React, { useEffect, useState } from 'react';
import { groupSalesByMonth, revNProfitMargin } from './utils';
import { Bar, BarChart, XAxis } from 'recharts';
import Papa from 'papaparse';
>>>>>>> deacc7786f071bc644f3b46df4165d8214dea359

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
<<<<<<< HEAD
} from "./card"
=======
} from './card';
>>>>>>> deacc7786f071bc644f3b46df4165d8214dea359
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
<<<<<<< HEAD
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
=======
} from './chart';

// import DATA from '../../../public/Dummy.csv';

const ProfitMargin = () => {
  const [salesRevenue, setSalesRevenue] = useState([]);
  const [profitQuantity, setProfitQuantity] = useState([]);

  useEffect(() => {
    const parsedData = Papa.parse("", {
      header: true,
      skipEmptyLines: true,
    }).data;

    const profit = revNProfitMargin(parsedData);
    setProfitQuantity(profit);

    const sales = groupSalesByMonth(parsedData);
    setSalesRevenue(sales);
  }, []);

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
>>>>>>> deacc7786f071bc644f3b46df4165d8214dea359
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
<<<<<<< HEAD
          <BarChart accessibilityLayer data={salesRevenue}>
=======
          <BarChart data={salesRevenue}>
>>>>>>> deacc7786f071bc644f3b46df4165d8214dea359
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
<<<<<<< HEAD
              tickFormatter={(value) => value}
=======
>>>>>>> deacc7786f071bc644f3b46df4165d8214dea359
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
<<<<<<< HEAD
  )
}

export default ProfitMargin
=======
  );
};

export default ProfitMargin;
>>>>>>> deacc7786f071bc644f3b46df4165d8214dea359
