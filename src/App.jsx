import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Research from "./pages/Research";
import Tracking from "./pages/Tracking";
import QuranMap from "./pages/QuranMap";
import Callback from "./pages/Callback";
import NavBar from "./components/NavBar";
import GlobalChat from "./components/GlobalChat";
import "./styles/main.css";

export default function App() {
  return (
    <BrowserRouter basename="/afaq">
      <NavBar />
      <div style={{ paddingTop:"60px" }}>
        <Routes>
          <Route path="/"         element={<Home />}      />
          <Route path="/map"      element={<QuranMap />}  />
          <Route path="/search"   element={<Search />}    />
          <Route path="/research" element={<Research />}  />
          <Route path="/tracking" element={<Tracking />}  />
          <Route path="/callback" element={<Callback />}  />
        </Routes>
      </div>
      <GlobalChat />
    </BrowserRouter>
  );
}
