import React from "react";
import "./index.scss";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import Home from "./pages/home";
import Newsletters from "./pages/newsletters/newsletters";
import Newsletter from "./pages/newsletter/newsletter";
import Association from "./pages/about/about";
import Action from "./pages/action/action";
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
    <BrowserRouter>
      <Meta />
      <Header />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/association" element={<Association />} />
        <Route path="/association/projets" element={<Project />} />
        <Route path="/association/nous-rejoindre" element={<Join />} />
        <Route path="/association/newsletter" element={<Newsletters />} />
        <Route path="/association/newsletter/:id" element={<Newsletter />} />
        <Route path="/association/don" element={<Donation />} />
        <Route path="/association/don/formulaire" element={<DonationForm />} />
        <Route path="/nos-actions" element={<Action />} />
        <Route path="/eglise" element={<Church />} />
        <Route path="/eglise/histoire" element={<History />} />
        <Route path="/eglise/cloches" element={<Bells />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/404" element={<PageNotFound />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </React.StrictMode>
);
