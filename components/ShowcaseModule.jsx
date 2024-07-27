import React from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HeaderShowcase from "../components/section/showcase/HeaderShowcase";
import CardsShowcase from "../components/section/showcase/CardsShowcase";

const ShowcaseModule = () => {
    return (
        <div>
            <Header />
            <div className="grid griw-row-none pt-20 md:pt-24 bg-gradient-to-b from-[#FFFFFF] to-[#EE9412] place-content-center">
                <HeaderShowcase />
                <CardsShowcase />
            </div>
            <Footer />
        </div>
    );
};

export default ShowcaseModule;
