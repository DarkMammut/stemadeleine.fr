import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import DynamicPage from "./pages/DynamicPage";
import NotFoundPage from "./pages/NotFoundPage";
import useOrganizationTheme from "./hooks/useOrganizationTheme";

function App() {
  // Initialize organization theme colors
  useOrganizationTheme();

  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={<HomePage />} />

          {/* Page 404 explicite */}
          <Route path="/404" element={<NotFoundPage />} />

          {/* Route universelle pour toutes les pages dynamiques */}
          <Route path="*" element={<DynamicPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
