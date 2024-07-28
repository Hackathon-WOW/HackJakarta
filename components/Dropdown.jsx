import React from 'react'

const Dropdown = () => {
    const [categories, setCategories] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [selected, setSelected] = useState("");
    const [open, setOpen] = useState(false);
  
    useEffect(() => {
      setCategories(Category);
    }, []);
  
  return (
    <div className="relative my-4">
              <div className={`w-72 font-medium ${
                    open ? "max-h-60" : "max-h-0"
                  }`}>
                <div
                  onClick={() => setOpen(!open)}
                  className={`bg-primary-green-dark w-full p-2 flex items-center justify-between rounded ${
                    !selected && "text-accent-superWhite"
                  }`}
                >
                  {selected
                    ? selected?.length > 25
                      ? selected?.substring(0, 25) + "..."
                      : selected
                    : "Select Categories"}
                  <BiChevronDown className={`text-xl ${open && "rotate-180"}`} />
                </div>
                <ul
                  className={`bg-primary-green-dark mt-2 overflow-y-auto ${
                    open ? "max-h-60 border border-white" : "max-h-0"
                  } `}
                >
                  <div className="flex items-center px-2 top-0 bg-primary-green-dark sticky border border-b-2 border-white">
                    <AiOutlineSearch className={`text-white text-lg block float-left cursor-pointer mr-2`} />
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value.toLowerCase())}
                      placeholder="Enter Categories name"
                      className="text-base bg-transparent w-full text-white focus:outline-none placeholder:text-slate-200 my-2"
                    />
                  </div>
                  {categories?.map((category) => (
                    <li
                      key={category}
                      className={`p-2 text-sm hover:bg-primary-orange-medium hover:text-black text-primary-orange-medium
                      ${
                        category?.toLowerCase() === selected?.toLowerCase() &&
                        "bg-primary-orange-medium text-accent-black"
                      }
                      ${
                        category?.toLowerCase().startsWith(inputValue)
                          ? "block"
                          : "hidden"
                      }`}
                      onClick={() => {
                        if (category?.toLowerCase() !== selected.toLowerCase()) {
                          setSelected(category);
                          setDataUMKM({ ...dataUMKM, Category: category });
                          setOpen(false);
                          setInputValue("");
                        }
                      }}
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
  )
}

export default Dropdown
