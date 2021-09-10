import AppStateWrapper from "@laststance/use-app-state";
import Authenticated from "auth/authenticated";
import { RealEstateListingPage } from "pages/RealEstateListingPage";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { initialState } from "state/app";
import "./App.css";
import Nav from "./nav/Nav";
import Start from "./pages/Start";

function App() {
  return (
    <AppStateWrapper initialState={initialState}>
      <Router>
        <div className="App px-4">
          <Nav />
          <Switch>
            <Route path="/listings">
              <Authenticated>
                <RealEstateListingPage />
              </Authenticated>
            </Route>
            <Route path="/">
              <Authenticated>
                <Start />
              </Authenticated>
            </Route>
          </Switch>
        </div>
      </Router>
    </AppStateWrapper>
  );
}

export default App;
