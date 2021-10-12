import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Nav from "./layout/Nav";
import ImpressPage from "./pages/ImpressPage";
import PrivacyPage from "./pages/PrivacyPage";
import SearchParamsPage from "./pages/SearchParamsPage";
import Footer from "./layout/Footer";

function App() {
    return (
        <Router>
            <div className="app">
                <Nav/>
                <Switch>
                    <Route path="/impress">
                        <ImpressPage/>
                    </Route>
                    <Route path="/privacy">
                        <PrivacyPage/>
                    </Route>
                    <Route path="/">
                        <SearchParamsPage/>
                    </Route>
                </Switch>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
