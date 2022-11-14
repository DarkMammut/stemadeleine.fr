import React from "react";
import "./index.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import Home from "./pages/home";
import Bells from "./pages/bells/bells";
// import About from './pages/About/about';
// import PageNotFound from './pages/404/page_not_found';
import Header from "./components/header/header";
// import Footer from "./components/footer/footer";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Router>
      <Header />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/cloches" element={<Bells />} />

        {/* <Route exact path="/about" element={<About />} />
        <Route path="*" element={<PageNotFound />} />
        <Route path="/404" element={<PageNotFound />} /> */}
      </Routes>
      {/* <Footer /> */}
    </Router>
  </React.StrictMode>
);
