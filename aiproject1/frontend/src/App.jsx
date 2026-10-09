import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Matches from "./pages/Matches";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import AILab from "./pages/AILab";
import MatchCenter from "./pages/MatchCenter";
import PlayerProfile from "./pages/PlayerProfile";
import TeamProfile from "./pages/TeamProfile";
import StrategyEngine from "./pages/StrategyEngine";


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/match/:id" element={<MatchCenter />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/players" element={<Players />} />
        <Route path="/ai-lab" element={<AILab />} />
        <Route path="/players/:id" element={<PlayerProfile />} />
        <Route path="/teams/:id" element={<TeamProfile />} />
        <Route path="/strategy" element={<StrategyEngine />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;