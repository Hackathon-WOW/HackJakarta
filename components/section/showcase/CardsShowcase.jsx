"use client"
import React from "react";
import Card from "@/components/Card";


const CardsShowcase = () => {
    return (
        <div>
            <div className="px-20 mb-20 mt-10">
                <div className="grid grid-cols-3 max-w-[1100px] gap-6">
                    <Card/> 
                    <Card/> 
                    <Card/> 
                    <Card/> 
                    <Card/> 
                    <Card/> 
                    <Card/> 
                    <Card/> 
                    <Card/> 

                </div>
            </div>
        </div>
    );
};

export default CardsShowcase;
