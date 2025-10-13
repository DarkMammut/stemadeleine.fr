import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/solid";
import useGetPages from "../hooks/useGetPages";
import IconButton from "./IconButton";

function Navigation() {
  const [toggle, setToggle] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const { tree, loading, error } = useGetPages();

  // Filtrer uniquement les pages visibles
  const visiblePages = tree.filter((page) => page.isVisible);

  const handleMenuEnter = (pageId) => {
    setHoveredMenu(pageId);
  };

  const handleMenuLeave = () => {
    setHoveredMenu(null);
  };

  if (loading) {
    return <div className="text-center p-4">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">Erreur: {error}</div>;
  }

  return (
    <div className="navigation">
      {/* Burger Menu Button */}
      <button
        className={`flex justify-center items-center fixed text-center border-none right-2.5 top-0 p-0 bg-transparent z-20 md:hidden`}
        type="button"
        onClick={() => setToggle(!toggle)}
        aria-label="button for navigation in menu"
      >
        <ul className="block outline-none cursor-pointer relative w-12 h-12">
          <li
            className={`absolute left-3 w-6 h-0.5 bg-gray-600 bg-opacity-70 rounded-full overflow-hidden transition-all duration-500 top-3.5 ${
              toggle ? "transform translate-y-2 rotate-45" : ""
            }`}
          />
          <li
            className={`absolute left-3 w-6 h-0.5 bg-gray-600 bg-opacity-70 rounded-full overflow-hidden transition-all duration-500 top-6 ${
              toggle ? "scale-x-0" : ""
            }`}
          />
          <li
            className={`absolute left-3 w-6 h-0.5 bg-gray-600 bg-opacity-70 rounded-full overflow-hidden transition-all duration-500 top-8.5 ${
              toggle ? "transform -translate-y-2 -rotate-45" : ""
            }`}
          />
        </ul>
      </button>

      {/* Navigation Menu */}
      <nav
        className={`fixed flex justify-center right-0 transition-all duration-300 z-10 ${
          !toggle ? "opacity-0 invisible" : "opacity-100 visible"
        } md:opacity-100 md:visible md:top-0 md:left-0 md:right-0 md:bg-transparent md:relative ${
          toggle
            ? "top-0 w-full h-screen bg-gradient-to-br from-gray-800 to-blue-900"
            : ""
        } md:h-auto`}
      >
        <ul
          className={`flex m-0 p-0 text-center list-none w-full ${
            toggle ? "flex-col justify-center" : "justify-center"
          } md:flex-row md:justify-center`}
        >
          {visiblePages.map((page) => (
            <li
              key={page.id}
              className={`
                relative flex items-center justify-center group
                ${toggle ? "flex-col py-5" : "px-10"}
                md:px-10 md:py-0
              `}
              onMouseEnter={() => handleMenuEnter(page.id)}
              onMouseLeave={handleMenuLeave}
            >
              <Link
                to={page.slug}
                className={`relative inline-flex text-decoration-none z-10
                  after:absolute after:content-[''] after:top-full after:left-0
                  after:w-full after:h-0.5 after:bg-secondary after:scale-x-0
                  after:origin-right after:transition-transform after:duration-500
                  hover:after:scale-x-100 hover:after:origin-left
                  ${toggle ? "text-white" : "text-black"}
                `}
                onClick={() => setToggle(false)}
              >
                <span className="overflow-hidden">
                  <div className="font-serif hover:text-white transition-colors duration-300 text-base md:text-lg uppercase">
                    {page.name}
                  </div>
                </span>
              </Link>

              {/* Zone invisible pour maintenir le hover */}
              {page.children.length > 0 && (
                <div className="absolute top-full left-0 w-full h-8 bg-transparent hidden md:block" />
              )}

              {/* Sous-menu */}
              {page.children.length > 0 && (
                <ul
                  className={`absolute left-1/2 top-full transform -translate-x-1/2 min-w-[200px] z-50 bg-primary-light rounded-b-lg shadow-lg flex flex-col transition-all duration-300 md:mt-8
                    ${hoveredMenu === page.id && !toggle ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"}
                    ${toggle ? "relative opacity-100 visible pointer-events-auto mt-4 bg-blue-700" : ""}
                  `}
                >
                  {page.children.map((child) => (
                    <li key={child.id} className="relative group/child">
                      <Link
                        to={child.slug}
                        onClick={() => setToggle(false)}
                        className="block px-4 py-3 transition-colors duration-200 relative
                            after:absolute after:content-[''] after:bottom-0 after:left-4 after:right-4
                            after:h-0.5 after:bg-secondary after:scale-x-0
                            after:origin-right after:transition-transform after:duration-300
                            hover:after:scale-x-100 hover:after:origin-left hover:text-white"
                      >
                        <span className="overflow-hidden">
                          <div className="text-xs md:text-sm uppercase font-serif transition-colors duration-300">
                            {child.name}
                          </div>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Donate Button (Mobile only) */}
        <IconButton
          as={Link}
          to="/association/don"
          icon={HeartIcon}
          label="Don"
          variant="secondary"
          className={`
            absolute bottom-7.5 left-1/2 transform -translate-x-1/2
            text-xl flex items-center gap-2 px-4 py-2 bg-red-500
            text-white rounded-lg hover:bg-red-600 transition-colors duration-300 uppercase
            ${toggle ? "block" : "hidden"}
            md:hidden
          `}
          onClick={() => setToggle(false)}
        />
      </nav>
    </div>
  );
}

export default Navigation;
