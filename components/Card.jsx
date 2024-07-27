import React, { useState } from "react";
import PropTypes from "prop-types";
import Status from "./Status";

const Card = ({ className = "" }) => {
    return (
        <div
        className={`flex w-full flex-col items-center gap-y-[5px] rounded-[20px] bg-primary-green-light px-10 py-[30px] text-primary-green-dark drop-shadow-lg ${className}`}
      >
        <img
          className="h-[200px] flex-shrink-0 object-cover object-center"
          src="/twitter.svg"
          loading="lazy"
         />
        <div className="grid grid-cols-2 gap-2 pt-[15px] px-0">
            <Status text="Kategori UMKM" color="bg-primary-green-dark" />
            <Status text="Skala UMKM" color="bg-primary-orange-medium" />
        </div>
        <div className="self-stretch pt-[15px]">
          <h2 className="text-xl font-bold leading-[normal]">
            Open Tender Title
          </h2>
        </div>
        <div className="flex items-center self-stretch">
          <p className="text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer efficitur a dui sed gravida. Pellentesque ut enim justo. Etiam nec risus tincidunt, vestibulum elit eu, volutpat dui. Ut imperdiet iaculis purus sed faucibus.
          </p>
        </div>
      </div>
    );
};

Card.propTypes = {
    className: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Card;
