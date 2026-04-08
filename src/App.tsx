import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PrintSPBU from "./pages/PrintSPBU";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/print" element={<PrintSPBU />} />
      </Routes>
    </BrowserRouter>
  );
}