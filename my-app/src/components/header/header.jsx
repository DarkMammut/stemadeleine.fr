import React from "react";
import Burger from "../burger/burger";
import "./header.scss";

function Header() {
  return (
    <header className="header">
      <div className="header__logo" />
      <div className="header__content">
        <h1 className="header__content__title">Les amis de Sainte Madeleine de la Jarrie</h1>
        <h2 className="header__content__subhead">Eglise de la Jarrie</h2>
      </div>
      <Burger />
    </header>
  );
}

export default Header;
