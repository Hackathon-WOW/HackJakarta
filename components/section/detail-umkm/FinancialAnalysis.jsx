"use client"
import React from "react";
import Search from "@/components/Search";
import { Category } from "../../../app/static/Category";
import Dropdown from "@/components/Dropdown";   
import Status from "@/components/Status";
import Button from "@/components/Button";

const FinancialAnalysis = () => {
    return (
        <div className="mx-20 my-10">
                <div>
                    <p className="text-3xl font-bold text-primary-green-dark">Financial Analysis</p>
                </div>
            <div className="grid grid-cols-4">
                <div className="flex flex-col">
                    <p className="text-lg font-bold text-primary-green-dark">Sales Trends</p>
                    <p className="text-sm text-primary-green-dark">Analyze historical sales trends to identify patterns and fluctuations over time, providing insights into peak sales periods and seasonal variations.</p>
                    <div></div>
                </div>
                <div className="flex flex-col">
                    <p className="text-lg font-bold text-primary-green-dark">Sales Trends</p>
                    <p className="text-sm text-primary-green-dark">Analyze historical sales trends to identify patterns and fluctuations over time, providing insights into peak sales periods and seasonal variations.</p>
                    <div></div>
                </div>
                <div className="flex flex-col">
                    <p className="text-lg font-bold text-primary-green-dark">Sales Trends</p>
                    <p className="text-sm text-primary-green-dark">Analyze historical sales trends to identify patterns and fluctuations over time, providing insights into peak sales periods and seasonal variations.</p>
                    <div></div>
                </div>
                <div className="flex flex-col">
                    <p className="text-lg font-bold text-primary-green-dark">Sales Trends</p>
                    <p className="text-sm text-primary-green-dark">Analyze historical sales trends to identify patterns and fluctuations over time, providing insights into peak sales periods and seasonal variations.</p>
                    <div></div>
                </div>
            </div>
        </div>
    );
};

export default FinancialAnalysis;
