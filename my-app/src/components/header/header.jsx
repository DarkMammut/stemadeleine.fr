import React from "react";
import Navigation from "../navigation/navigation";
import "./header.scss";

function Header() {
  return (
    <header className="header">
      <div className="header__logo" />
      <div className="header__content">
        <h1 className="header__content__title">Les amis de Sainte Madeleine de la Jarrie</h1>
        <h2 className="header__content__subhead">Eglise de la Jarrie</h2>
      </div>
      <Navigation />
    </header>
  );
}

export default Header;
