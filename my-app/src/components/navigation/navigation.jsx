import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./navigation.scss";

const LINKS = [
  { id: "link1", name: "Accueil", path: "/" },
  { id: "link2", name: "Histoire", path: "/histoire" },
  { id: "link3", name: "Les cloches", path: "/cloches" },
  { id: "link4", name: "Projets", path: "/projets" }
];

function Navigation() {
  const [toggle, setToggle] = useState(0);

  return (
    <div className="navigation">
      <button
        className="navigation__burger"
        type="button"
        onClick={() => setToggle(toggle ? 0 : 1)}
        data-toggle={toggle}>
        <ul className="navigation__burger__menu">
          <li className="navigation__burger__menu__line" />
          <li className="navigation__burger__menu__line" />
          <li className="navigation__burger__menu__line" />
        </ul>
      </button>
      <nav className="navigation__menu" data-toggle={toggle}>
        <ul className="navigation__menu__nav">
          {LINKS.map((link) => (
            <li key={link.id} className="navigation__menu__nav__link">
              <Link to={link.path}>
                <span>
                  <div>{link.name}</div>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Navigation;
