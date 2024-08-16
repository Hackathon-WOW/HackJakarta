import React from "react";
import Footer from "./Footer";
import Header from "./Header";
import Profil from "./section/detail-umkm/Profil";
import FinancialAnalysis from "./section/detail-umkm/FinancialAnalysis";

const DetailUMKMModule = () => {
    return (
        <div>
            <Header />
            <div className="">
                <Profil/>
                <FinancialAnalysis/>
            </div>
            <Footer />
        </div>
    );
};

export default DetailUMKMModule;
