import React, { useState } from "react";
import PropTypes from "prop-types";

const Dropdown = ({ className = "", categories }) => {
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);

    const handleChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    return (
            <div className="w-full py-2">
                <select
                    value={selectedCategory}
                    onChange={handleChange}
                    placeholder="Select Category"
                    className="bg-white border border-gray-300 rounded-lg w-full p-3 drop-shadow-lg"
                >
                    {categories.map((category, index) => (
                        <option key={index} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>
    );
};

Dropdown.propTypes = {
    className: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Dropdown;
