import React from "react";
import "./page_not_found.scss";

function PageNotFound() {
  return (
    <main className="page">
      <div id="background" />
      <div className="top">
        <h1 className="title">404</h1>
        <h3 className="subhead">page non trouvée</h3>
      </div>
      <div className="container">
        <div className="ghost-copy">
          <div className="one" />
          <div className="two" />
          <div className="three" />
          <div className="four" />
        </div>
        <div className="ghost">
          <div className="face">
            <div className="eye" />
            <div className="eye-right" />
            <div className="mouth" />
          </div>
        </div>
        <div className="shadow" />
      </div>
      <div className="bottom">
        <p className="text">Boo, looks like a ghost stole this page!</p>
        <div className="buttons">
          <button className="btn" type="button">
            Back
          </button>
          <button className="btn" type="button">
            Home
          </button>
        </div>
      </div>
    </main>
  );
}

export default PageNotFound;
