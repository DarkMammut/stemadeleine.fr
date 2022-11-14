import React from "react";
import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { id: "link1", name: "Acceuil", path: "/" },
  { id: "link2", name: "A Propos", path: "/about" },
  { id: "link3", name: "Les Cloches", path: "/cloches" }
];

function Header() {
  const location = useLocation();
  return (
    <header>
      <div className="header__content">
        <h1 className="header__content__title">Les amis de Sainte Madeleine</h1>
        <h2 className="header__content__subhead">Eglise de la Jarrie</h2>
      </div>
      <nav className="header__navigation">
        <ul className="header__navigation__content">
          {LINKS.map((link) => (
            <li key={link.id} className="header__navigation__content__link">
              <Link
                to={link.path}
                style={{
                  textDecoration: link.path === location.pathname ? "underline" : "none"
                }}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
