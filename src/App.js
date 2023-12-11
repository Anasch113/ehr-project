import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatApp from "./Components/Chat";
import MedicalIdVerification from "./pages/MedicalIdentification";
import MedicalIdProvider from "./Components/MedicalIdProvider";
import Summary from "./Components/Summary";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <MedicalIdProvider>
        <Routes>
            <Route index element={<MedicalIdVerification />} />
            <Route path="/chat" element={<ChatApp />} />
            <Route path="/summary" element={<Summary />} />
        </Routes>
          </MedicalIdProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
