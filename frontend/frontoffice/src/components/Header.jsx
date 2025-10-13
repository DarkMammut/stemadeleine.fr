import React from "react";
import { Link } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/solid";
import Navigation from "./Navigation";
import IconButton from "./IconButton";
import useGetOrganization from "../hooks/useGetOrganization";
import useGetMedia from "../hooks/useGetMedia";

function Header() {
  const { settings } = useGetOrganization();
  const { mediaUrl: logoUrl } = useGetMedia(settings?.logoMedia);

  // URL du logo avec fallback
  const finalLogoUrl = logoUrl || `${process.env.PUBLIC_URL}/logo.png`;

  return (
    <header>
      {/* Header principal */}
      <div className="fixed top-0 left-0 w-full h-24 flex justify-center items-center bg-gradient-primary z-40 shadow-xl">
        {/* Logo */}
        <Link to="/">
          <img
            src={finalLogoUrl}
            alt="Logo"
            loading="lazy"
            className="fixed top-0 left-0 h-14 md:h-24 w-auto rounded-tr-lg rounded-br-lg bg-transparent z-20"
            style={{ objectFit: "contain" }}
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
          className="hidden lg:flex absolute right-5 xl:right-5 uppercase"
        />
      </div>
    </header>
  );
}

export default Header;
