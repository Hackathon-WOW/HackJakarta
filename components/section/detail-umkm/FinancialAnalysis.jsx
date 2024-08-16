"use client"
import React from "react";
import ProfitMargin from "./ProfitMargin";
import SalesRevenues from "./SalesRevenues";
// import AssetAllocation from "./AssetAllocation";
import  dynamic from "next/dynamic";

const AssetAllocation = dynamic(() => import("./AssetAllocation"), {ssr:false})

const FinancialAnalysis = () => {
    return (
        <>
            <div className="mx-20 my-20">
                    <div>
                        <p className="text-3xl font-bold text-primary-green-dark">Financial Analysis</p>
                    </div>
                <div className="grid grid-cols-4 gap-5 mt-2">
                    <div className="flex flex-col">
                        <p className="text-lg font-bold text-primary-green-dark">Sales Trends</p>
                        <p className="text-sm text-primary-green-dark">Analyze historical sales trends to identify patterns and fluctuations over time, providing insights into peak sales periods and seasonal variations.</p>
                        <div></div>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-lg font-bold text-primary-green-dark">Quantity-Based Sales by Product Category</p>
                        <p className="text-sm text-primary-green-dark">Examine the sales distribution across different product categories based on profitability, highlighting which categories contribute most significantly to overall profit.</p>
                        <div></div>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-lg font-bold text-primary-green-dark">Profit-Based Sales by Product Category</p>
                        <p className="text-sm text-primary-green-dark">Assess sales performance by product category based on the quantity sold, identifying the most popular products and understanding consumer demand.</p>
                        <div></div>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-lg font-bold text-primary-green-dark">Revenue and Profit Margins</p>
                        <p className="text-sm text-primary-green-dark">Evaluate revenue generation and profit margins over time, offering a comprehensive view of financial health and operational efficiency.</p>
                        <div></div>
                    </div>
                </div>
                <AssetAllocation/>
                <div className="my-10 w-full rounded-xl bg-gray-200 p-10">
                    <div className="grid grid-cols-2 gap-5">
                        <ProfitMargin/>
                        <SalesRevenues/>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                    </div>

                </div>
            </div>
        </>
    );
};

export default FinancialAnalysis;
