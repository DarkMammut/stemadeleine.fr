import React from "react";
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import Navigation from "../navigation/navigation";
import Banner from "../banner/banner";
import "./header.scss";

function Header() {
  const url = `${process.env.PUBLIC_URL}/logo.png`;
  const style = { backgroundImage: `url(${url})` };
  return (
    <header>
      <div className="header">
        <Link to="/">
          <div className="header__logo" style={style} />
        </Link>
        <Navigation />
        <Link
          to="https://www.helloasso.com/associations/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires/2"
          className="btn btn--donate no style-btn">
          <FaHeart className="heart" />
          <span>Don</span>
        </Link>
      </div>
      <Banner />
    </header>
  );
}

export default Header;
