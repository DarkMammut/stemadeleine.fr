import React from "react";
import "./index.scss";
import bannerArray from "../../assets/banner.json";
import Banner from "../../components/banner/banner";

function Home() {
  const banner = bannerArray.find((obj) => {
    return obj.id === "b-home";
  });
  return (
    <main>
      <Banner content={banner} />
    </main>
  );
}

export default Home;
