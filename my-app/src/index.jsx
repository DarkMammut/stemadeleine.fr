import React from "react";
import "./index.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import Home from "./pages/home";
import Association from "./pages/association/association";
import About from "./pages/about/about";
import Join from "./pages/join/join";
import Donation from "./pages/donation/donation";
import Project from "./pages/project/project";
import Church from "./pages/church/church";
import History from "./pages/history/history";
import Bells from "./pages/bells/bells";
import Contact from "./pages/contact/contact";
import PageNotFound from "./pages/404/page_not_found";
import Header from "./components/header/header";
import Banner from "./components/banner/banner";
import Footer from "./components/footer/footer";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Router>
      <Header />
      <Banner />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/association" element={<Association />} />
        <Route exact path="/association/qui-sommes-nous" element={<About />} />
        <Route exact path="/association/nous-rejoindre" element={<Join />} />
        <Route exact path="/association/don" element={<Donation />} />
        <Route exact path="/projets" element={<Project />} />
        <Route exact path="/eglise" element={<Church />} />
        <Route exact path="/eglise/histoire" element={<History />} />
        <Route exact path="/eglise/cloches" element={<Bells />} />
        <Route exact path="/contact" element={<Contact />} />
        <Route path="*" element={<PageNotFound />} />
        <Route exact path="/404" element={<PageNotFound />} />
      </Routes>
      <Footer />
    </Router>
  </React.StrictMode>
);
