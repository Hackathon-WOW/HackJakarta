"use client"
import React from "react";
import Search from "@/components/Search";
import { Category } from "../../../app/static/Category";
import Dropdown from "@/components/Dropdown";   
import Status from "@/components/Status";
import Button from "@/components/Button";

const Profil = () => {
    return (
        <div className="mx-20 my-10">
            <div className="grid grid-cols-3">
                <div className="flex flex-row items-center">
                    <div>
                        <img src="./right-green.svg" className="" />  
                    </div>
                    <div className="bg-red-700">
                        <img src="" className="mx-auto w-[400px] h-[300px]" />
                    </div>
                    <div>
                        <img src="./left-green.svg" className="" />  
                    </div>
                </div>
                <div className="col-span-2 ml-10 text-left">
                    <div>
                        <p className="text-3xl font-bold text-primary-green-dark">PT ABC</p>
                    </div>
                    <div>
                        <p className="text-md font-bold text-primary-green-dark">Since YYYY</p>
                    </div>
                    <div className="flex flex-row my-5">
                        <Status text="Food and Beverages" color="bg-primary-green-dark" />
                        <Status text="Mikro" color="bg-primary-orange-medium" />
                    </div>
                    <div className="my-5">   
                        <p className="text-sm font-bold text-primary-green-dark text-center inline-block">About This Business</p>
                        <p className="text-sm text-primary-green-dark text-justify">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer efficitur a dui sed gravida. Pellentesque ut enim justo. Etiam nec risus tincidunt, vestibulum elit eu, volutpat dui. Ut imperdiet iaculis purus sed faucibus. Nunc mattis lectus ut arcu placerat aliquet. Nulla volutpat vestibulum arcu non scelerisque. Vestibulum scelerisque ut libero at egestas. Praesent id vulputate massa. Duis quis convallis arcu.
                        </p>
                    </div>
                    <div className="max-w-[250px] my-5">   
                        <p className="text-sm font-bold text-primary-green-dark mb-1">Proposal</p>
                        <Button color="bg-primary-green-dark">
                            <div className="grid grid-cols-6">
                            <div className="col-span-5">
                                <p className="text-sm text-white font-bold">Open in Google Maps</p>
                            </div>
                            <div className="mx-auto my-auto">
                                <img src="arrow_right.svg" className="h-[24px]" alt="Arrow Right" />
                            </div>
                            </div>
                        </Button>
                    </div>
                    <div className="max-w-[250px] my-5">   
                        <p className="text-sm font-bold text-primary-green-dark mb-1">Address</p>
                        <Button color="bg-primary-green-dark">
                            <div className="grid grid-cols-6">
                            <div className="col-span-5">
                                <p className="text-sm text-white font-bold">Open in Google Maps</p>
                            </div>
                            <div className="mx-auto my-auto">
                                <img src="arrow_right.svg" className="h-[24px]" alt="Arrow Right" />
                            </div>
                            </div>
                        </Button>
                    </div>
                    <div className="">
                        <p className="text-sm font-bold text-primary-green-dark mb-1">Contact Person</p>
                        <p className="text-sm text-primary-green-dark">8888888888888</p>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default Profil;
