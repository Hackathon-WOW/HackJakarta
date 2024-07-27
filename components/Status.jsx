import React, { useState } from "react";
import PropTypes from "prop-types";

const Status = ({ className = "", text = "Kategori UMKM", color = "bg-primary-dark-green" }) => {

    return (
        <div
            className={`flex w-full items-center justify-center rounded-3xl ${color} px-5 py-2.5 drop-shadow-lg ${className}`}
        >
            <div className="text-xs text-center leading-[normal] tracking-[0px] text-white">
                {text}
            </div>
        </div>
    );
};

Status.propTypes = {
    className: PropTypes.string,
    text: PropTypes.string,
    color: PropTypes.string,
};

export default Status;
