import React, { useState } from "react";
import { HashRouter as Router, Route,Routes  } from "react-router-dom";
import Home from "../routes/Home";
import Completed from "../routes/Completed";
import Active from "../routes/Active";
import TimeOver from "../routes/TimeOver";

const AppRouter = () => {

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home/>}/>
        <Route exact path="/1" element={<Completed/>}/>
        <Route exact path="/2" element={<Active/>}/>
        <Route exact path="/3" element={<TimeOver/>}/>
      </Routes>
  </Router>
  );
};
export default AppRouter;