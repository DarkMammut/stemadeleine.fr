import React from "react";
import Article from "../../components/article/article";
import "./church.scss";
import ArticlesData from "../../assets/church.json";

function Church() {
  return (
    <main id="church">
      <div className="container">
        {/* <p className="church__paragraph"></p> */}
        <Article Articles={ArticlesData} />
      </div>
    </main>
  );
}

export default Church;
