import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "./navigation.scss";

const LINKS = [
  { id: "link1", name: "Acceuil", path: "/" },
  { id: "link2", name: "Histoire", path: "/histoire" },
  { id: "link3", name: "Les cloches", path: "/cloches" },
  { id: "link4", name: "Projet", path: "/projet" }
];

function Navigation() {
  const location = useLocation();
  const [toggle, setToggle] = useState(0);

  return (
    <div className="navigation">
      <button
        className="navigation__burger"
        type="button"
        onClick={() => setToggle(toggle ? 0 : 1)}
        toggle={toggle}>
        <ul className="navigation__burger__menu">
          <li className="navigation__burger__menu__line" />
          <li className="navigation__burger__menu__line" />
          <li className="navigation__burger__menu__line" />
        </ul>
      </button>
      <nav className="navigation__menu">
        <ul className="navigation__menu__nav">
          {LINKS.map((link) => (
            <li key={link.id} className="navigation__menu__nav__link">
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
  );
}

export default Navigation;
