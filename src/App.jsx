import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Callback from "./pages/Callback";
import NavBar from "./components/NavBar";
import "./styles/main.css";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div style={{ paddingTop: "60px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
