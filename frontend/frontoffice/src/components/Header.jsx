import React from "react";
import { Link } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/solid";
import Navigation from "./Navigation";
import IconButton from "./IconButton";
import useGetOrganization from "../hooks/useGetOrganization";
import useGetMedia from "../hooks/useGetMedia";

function Header() {
  const { settings, loading, error } = useGetOrganization();
  const { mediaUrl: logoUrl } = useGetMedia(settings?.logoMedia);

  // URL du logo avec fallback
  const finalLogoUrl = logoUrl || `${process.env.PUBLIC_URL}/logo.png`;

  return (
    <header>
      {/* Header principal */}
      <div className="fixed top-0 left-0 w-full h-16 md:h-20 lg:h-24 flex justify-center items-center bg-gradient-mixed z-40 shadow-xl">
        {/* Logo */}
        <Link to="/">
          <div
            className="fixed top-0 left-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-tr-lg rounded-br-lg bg-contain bg-no-repeat bg-transparent z-20"
            style={{
              backgroundImage: `url(${finalLogoUrl})`,
            }}
          />
        </Link>

        {/* Navigation */}
        <Navigation />

        {/* Bouton Don - visible uniquement sur desktop */}
        <IconButton
          as={Link}
          to="/association/don"
          icon={HeartIcon}
          label="Don"
          variant="secondary"
          className="hidden lg:flex absolute top-3 right-5 xl:top-3 xl:right-5 uppercase"
        />
      </div>
    </header>
  );
}

export default Header;
