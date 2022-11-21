import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../navigation/navigation";
import "./header.scss";

function Header() {
  const url = `${process.env.PUBLIC_URL}/logo.png`;
  const style = { backgroundImage: `url(${url})` };
  return (
    <header className="header">
      <Link to="/">
        <div className="header__logo" style={style} />
      </Link>
      <Navigation />
    </header>
  );
}

export default Header;
