import React from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HeaderShowcase from "../components/section/showcase/HeaderShowcase";

const ShowcaseModule = () => {
    return (
        <div>
            <Header />
            <div className="flex  w-screen min-h-screen pt-20 md:pt-24 bg-gradient-to-b from-[#FFFFFF] to-[#EE9412] overflow-x-hidden justify-center">
                <HeaderShowcase />
            </div>
            <Footer />
        </div>
    );
};

export default ShowcaseModule;
