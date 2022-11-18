import React from "react";
import Navigation from "../navigation/navigation";
import "./header.scss";

function Header() {
  return (
    <header className="header">
      <div className="header__logo" />
      <Navigation />
    </header>
  );
}

export default Header;
