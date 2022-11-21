import React from "react";
import "./index.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import Home from "./pages/home";
// import Association from "./pages/association/association";
import Bells from "./pages/bells/bells";
import History from "./pages/history/history";
import Project from "./pages/project/project";
import PageNotFound from "./pages/404/page_not_found";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Router>
      <Header />
      <Routes>
        <Route exact path="/" element={<Home />} />
        {/* <Route exact path="/association" element={<Association />} />
        <Route exact path="/association/qui-sommes-nous" element={<Association />} />
        <Route exact path="/association/nous-rejoindre" element={<Association />} />
        <Route exact path="/association/don" element={<Association />} /> */}
        <Route exact path="/projets" element={<Project />} />
        {/* <Route exact path="/eglise" element={<Eglise />} /> */}
        <Route exact path="/eglise/histoire" element={<History />} />
        <Route exact path="/eglise/cloches" element={<Bells />} />
        {/* <Route exact path="/contact" element={<Contact />} /> */}
        <Route path="*" element={<PageNotFound />} />
        <Route path="/404" element={<PageNotFound />} />
      </Routes>
      <Footer />
    </Router>
  </React.StrictMode>
);
