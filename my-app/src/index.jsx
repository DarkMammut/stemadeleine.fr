import React from "react";
import "./index.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import Home from "./pages/home";
import Newsletters from "./pages/newsletters/newsletters";
import Newsletter from "./pages/newsletter/newsletter";
import Association from "./pages/about/about";
import Realisation from "./pages/realisation/realisation";
import Join from "./pages/join/join";
import Donation from "./pages/donation/donation";
import DonationForm from "./pages/donationform/donationform";
import Project from "./pages/project/project";
import Church from "./pages/church/church";
import History from "./pages/history/history";
import Bells from "./pages/bells/bells";
import Contact from "./pages/contact/contact";
import PageNotFound from "./pages/404/page_not_found";
import Meta from "./components/meta/meta";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Router>
      <Meta />
      <Header />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/newsletter" element={<Newsletters />} />
        <Route exact path="/newsletter/:id" element={<Newsletter />} />
        <Route exact path="/association" element={<Association />} />
        <Route exact path="/association/projets" element={<Project />} />
        <Route exact path="/association/nous-rejoindre" element={<Join />} />
        <Route exact path="/association/don" element={<Donation />} />
        <Route exact path="/association/don/formulaire" element={<DonationForm />} />
        <Route exact path="/nos-realisations" element={<Realisation />} />
        <Route exact path="/eglise" element={<Church />} />
        <Route exact path="/eglise/histoire" element={<History />} />
        <Route exact path="/eglise/cloches" element={<Bells />} />
        <Route exact path="/contact" element={<Contact />} />
        <Route exact path="/404" element={<PageNotFound />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Footer />
    </Router>
  </React.StrictMode>
);
