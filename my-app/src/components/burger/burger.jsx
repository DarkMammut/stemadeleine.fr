import React from "react";
import { useLocation, Link } from "react-router-dom";
import "./burger.scss";

const LINKS = [
  { id: "link1", name: "Acceuil", path: "/" },
  { id: "link2", name: "Histoire", path: "/histoire" },
  { id: "link3", name: "Les cloches", path: "/cloches" },
  { id: "link4", name: "Projet", path: "/projet" }
];

function Burger() {
  const location = useLocation();

  return (
    <div className="burger">
      <input type="checkbox" id="burger-toggle" />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor="burger-toggle" className="burger-menu">
        <div className="line" />
        <div className="line" />
        <div className="line" />
      </label>
      <div className="menu">
        <nav className="menu__nav">
          <ul className="menu__nav__content">
            {LINKS.map((link) => (
              <li key={link.id} className="menu__nav__content__link">
                <Link to={link.path}>
                  <span>
                    <div
                      style={{
                        fontWeight: link.path === location.pathname ? "bold" : "none"
                      }}>
                      {link.name}
                    </div>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Burger;
