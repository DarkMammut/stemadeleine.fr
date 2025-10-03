import React from "react";
import {Link} from "react-router-dom";
import {HeartIcon} from "@heroicons/react/24/solid";
import Navigation from "./Navigation";

function Header() {
    return (
        <header>
            {/* Header principal */}
            <div
                className="fixed top-0 left-0 w-full h-16 md:h-20 lg:h-24 flex justify-center items-center bg-gradient-mixed z-40 shadow-xl">
                {/* Logo */}
                <Link to="/">
                    <div
                        className="fixed top-0 left-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-tr-lg rounded-br-lg bg-contain bg-no-repeat bg-transparent z-20"
                        style={{backgroundImage: `url(${process.env.PUBLIC_URL}/logo.png)`}}
                    />
                </Link>

                {/* Navigation */}
                <Navigation/>

                {/* Bouton Don - visible uniquement sur desktop */}
                <Link
                    to="/association/don"
                    className="hidden lg:flex absolute top-3 right-5 xl:top-3 xl:right-5 items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-600 text-white rounded-lg transition-colors"
                >
                    Don
                    <HeartIcon className="text-sm"/>
                </Link>
            </div>
        </header>
    );
}

export default Header;
