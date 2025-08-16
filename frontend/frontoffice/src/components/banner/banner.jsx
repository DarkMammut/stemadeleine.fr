import React from "react";
import { useLocation } from "react-router-dom";
import Data from "../../assets/header.json";
import "./banner.scss";

function reduceUrl(url) {
  const dernierSlashIndex = url.lastIndexOf("/");
  if (dernierSlashIndex > 0) {
    return url.substring(0, dernierSlashIndex);
  }
  return url;
}

function Banner() {
  const location = useLocation();
  let path = location.pathname;
  let reducedPath = reduceUrl(path);
  let found = "";

  if (path === reducedPath || reducedPath === "/nos-actions") {
    found = Data.find((helmet) => helmet.path === reducedPath);

    if (!found) {
      found = Data.find((helmet) => helmet.id === "Error-404");
    }
  } else {
    if (path === "/association/don/formulaire" || reducedPath === "/association/newsletter") {
      path = reducedPath;
      reducedPath = "/association";
    }

    const mainObject = Data.find((object) => object.path === reducedPath);
    const subLink = mainObject.sublinks.find((helmet) => reducedPath + helmet.path === path);

    if (!mainObject || !subLink) {
      found = Data.find((helmet) => helmet.id === "Error-404");
    } else {
      found = mainObject.sublinks.find((helmet) => reducedPath + helmet.path === path);
    }
  }

  const url = process.env.PUBLIC_URL + found.url;
  const style = { backgroundImage: `url(${url})` };

  const handleClick = () => {
    const element = document.getElementById("welcome");
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  };

  switch (found.type) {
    case "large":
      return (
        <div className="container-banner">
          <div className="l-banner" style={style}>
            <div className="l-banner__textarea">
              <h1 className="l-banner__textarea__title">{found.title}</h1>
              <h2 className="l-banner__textarea__subhead">{found.subhead}</h2>
            </div>
            <button
              className="l-banner__down no-style-btn"
              type="button"
              onClick={handleClick}
              aria-label="button for scroll down">
              <div className="l-banner__down__chevron">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6.34317 7.75732L4.92896 9.17154L12 16.2426L19.0711 9.17157L17.6569 7.75735L12 13.4142L6.34317 7.75732Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      );

    case "small":
      return (
        <div className="banner" style={style}>
          <div className="banner__textarea">
            <h1 className="banner__textarea__title">{found.title}</h1>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default Banner;
