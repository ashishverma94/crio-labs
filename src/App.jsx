
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import HealthFitness from "./pages/HealthFitness";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/health-fitness"
          element={<HealthFitness />}
        />

        {/* Add future app routes here */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
