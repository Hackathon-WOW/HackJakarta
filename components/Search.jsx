import React from "react";
import PropTypes from "prop-types";

const Search = ({ className = "" }) => {
    return (
        <div
            className={`flex w-full flex-wrap items-center gap-x-2.5 gap-y-2.5 rounded-lg bg-white py-3.5 pl-[22px] pr-[22px] drop-shadow-lg ${className}`}
        >
            <div className="font-poppins text-2xl leading-[normal] tracking-[0px] text-gray-600">
                Placeholder
            </div>
        </div>
    );
};

Search.propTypes = {
    className: PropTypes.string,
};

export default Search;
