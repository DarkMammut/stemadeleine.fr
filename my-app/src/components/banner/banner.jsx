import React from "react";
import { useLocation, Link } from "react-router-dom";
import bannerArray from "../../assets/banner.json";
import "./banner.scss";

function Banner() {
  const location = useLocation();
  const found = bannerArray.find((banner) => banner.location === location.pathname);
  const url = process.env.PUBLIC_URL + found.url;
  const style = { backgroundImage: `url(${url})` };

  switch (found.type) {
    case "large":
      return (
        <div className="container">
          <div className="l-banner" style={style}>
            <div className="l-banner__textarea">
              <h1 className="l-banner__textarea__title">{found.title}</h1>
              <span className="l-banner__textarea__subhead">{found.subhead}</span>
            </div>
            <Link className="l-banner__down" to="#news">
              <div className="l-banner__down__chevron">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6.34317 7.75732L4.92896 9.17154L12 16.2426L19.0711 9.17157L17.6569 7.75735L12 13.4142L6.34317 7.75732Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      );

    default:
      return (
        <div className="banner" style={style}>
          <div className="banner__textarea">
            <h1 className="banner__textarea__title">{found.title}</h1>
          </div>
        </div>
      );
  }
}

export default Banner;
