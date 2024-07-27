import React from "react";
import Footer from "@/components/Footer";

import LandingNavbar from "@/components/elements/Navbar/LandingNavbar";

const ShowcaseModule = ()=> {
	return (
		<>
			<div className="flex flex-col w-screen min-h-screen pt-20 md:pt-24 bg-[#F5F0E9] overflow-x-hidden">
				<LandingNavbar requiredAuth={true} />

                <Footer/>
      
			</div>
		</>
	);
};

export default ShowcaseModule;
