"use client"
import React from "react";
import Search from "@/components/Search";
import { Category } from "../../../app/static/Category";
import Dropdown from "@/components/Dropdown";   

const HeaderShowcase = () => {
    return (
        <div>
            <div className="grid grid-rows-2 max-w-[800px]">
                <p className="text-7xl font-bold text-primary-green-dark text-center">UMKM Showcase</p>
                <div className="">
                    <p className="text-xl font-bold text-primary-green-dark text-center">
                        Identify and evaluate emerging businesses with substantial <span className="text-primary-orange-dark">growth prospects</span>, offering the opportunity to invest in future industry leaders.</p>
                </div>
            </div>
            <div className="grid grid-rows-2">
                <div>
                    <Search className="max-w-[800px]"/>
                </div>
                <div className="grid grid-cols-2">
                    <Dropdown categories={Category} />
                    <Dropdown categories={Category} />
                </div>
            </div>  
        </div>
    );
};

export default HeaderShowcase;
