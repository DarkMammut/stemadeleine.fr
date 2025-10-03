import React, {useState} from "react";
import {Link} from "react-router-dom";
import {HeartIcon} from "@heroicons/react/24/solid";
import useGetPages from "../hooks/useGetPages";

function Navigation() {
    const [toggle, setToggle] = useState(false);
    const {tree, loading, error} = useGetPages();

    // Filtrer uniquement les pages visibles
    const visiblePages = tree.filter(page => page.isVisible);

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
                className={`
          flex justify-center items-center fixed text-center
          border-none right-2.5 top-0 p-0 bg-transparent z-20
          md:hidden
        `}
                type="button"
                onClick={() => setToggle(!toggle)}
                aria-label="button for navigation in menu"
            >
                <ul className="block outline-none cursor-pointer relative w-12 h-12">
                    <li className={`
            absolute left-3 w-6 h-0.5 bg-gray-600 bg-opacity-70 
            rounded-full overflow-hidden transition-all duration-500
            top-3.5
            ${toggle ? 'transform translate-y-2 rotate-45' : ''}
          `}/>
                    <li className={`
            absolute left-3 w-6 h-0.5 bg-gray-600 bg-opacity-70 
            rounded-full overflow-hidden transition-all duration-500
            top-6
            ${toggle ? 'scale-x-0' : ''}
          `}/>
                    <li className={`
            absolute left-3 w-6 h-0.5 bg-gray-600 bg-opacity-70 
            rounded-full overflow-hidden transition-all duration-500
            top-8.5
            ${toggle ? 'transform -translate-y-2 -rotate-45' : ''}
          `}/>
                </ul>
            </button>

            {/* Navigation Menu */}
            <nav className={`
        fixed flex justify-center right-0 transition-all duration-300 z-10
        ${!toggle ? 'opacity-0 invisible' : 'opacity-100 visible'}
        md:opacity-100 md:visible md:top-0 md:left-0 md:right-0 
        md:bg-transparent md:relative
        ${toggle ? 'top-0 w-full h-screen bg-gradient-to-br from-gray-800 to-blue-900' : ''}
        md:h-auto
      `}>
                <ul className={`
          flex m-0 p-0 text-center list-none w-full
          ${toggle ? 'flex-col justify-center' : 'justify-center'}
          md:flex-row md:justify-center
        `}>
                    {visiblePages.map((page) => (
                        <li key={page.id} className={`
              relative flex items-center justify-center
              ${toggle ? 'flex-col py-5' : 'px-10'}
              md:px-10 md:py-0
            `}>
                            <Link
                                to={page.slug}
                                className={`relative inline-flex text-decoration-none z-10
                  hover:after:scale-x-100 hover:after:origin-left
                  after:absolute after:content-[''] after:top-full after:left-0 
                  after:w-full after:h-0.5 after:bg-blue-500 after:scale-x-0 
                  after:origin-right after:transition-transform after:duration-500
                  ${toggle ? 'text-white' : 'text-black'}
                  ${page.children.length > 0 ? 'group' : ''}
                `}
                                onClick={() => setToggle(false)}
                            >
                <span className="overflow-hidden">
                  <div className="font-serif hover:text-white transition-colors duration-300">
                    {page.name}
                  </div>
                </span>
                            </Link>

                            {/* Submenu */}
                            {page.children.length > 0 && (
                                <ul className={`
                  flex flex-col justify-around bg-transparent
                  ${toggle ? 'visible opacity-100 mt-2' : 'invisible opacity-0 absolute top-full pt-6 w-50 left-1/2 transform -translate-x-1/2'}
                  md:group-hover:visible md:group-hover:opacity-100 md:group-hover:animate-fadeIn
                  transition-all duration-700
                `}>
                                    {page.children
                                        .filter(child => child.isVisible)
                                        .map((child) => (
                                            <li key={child.id} className="bg-blue-600 md:bg-blue-600">
                                                <Link
                                                    to={child.slug}
                                                    onClick={() => setToggle(false)}
                                                    className="w-full block text-white hover:bg-blue-700 transition-colors duration-300"
                                                >
                        <span className="overflow-hidden">
                          <div className="text-xs p-1.5 md:p-1">
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
                <Link
                    to="/association/don"
                    className={`
            absolute bottom-7.5 left-1/2 transform -translate-x-1/2 
            text-xl flex items-center gap-2 px-4 py-2 bg-red-500 
            text-white rounded-lg hover:bg-red-600 transition-colors duration-300
            ${toggle ? 'block' : 'hidden'}
            md:hidden
          `}
                    onClick={() => setToggle(false)}
                >
                    Don
                    <HeartIcon className="w-4 h-4"/>
                </Link>
            </nav>
        </div>
    );
}

export default Navigation;
