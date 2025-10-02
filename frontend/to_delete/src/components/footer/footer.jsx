import React from "react";
import { Link } from "react-router-dom";
import "./footer.scss";

function Footer() {
  const url = `${process.env.PUBLIC_URL}/logo.png`;
  const style = { backgroundImage: `url(${url})` };
  return (
    <footer className="footer">
      <Link to="/">
        <div className="footer__logo" style={style} />
      </Link>
      <span className="footer__copyright">
        &copy; 2022 Association Les amis de Sainte Madeleine de la Jarrie.
        <br />
        All rights reserved.
      </span>
    </footer>
  );
}

export default Footer;
