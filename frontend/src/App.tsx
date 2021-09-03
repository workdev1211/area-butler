import React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import './App.css';
import Nav from "./nav/Nav";
import Start from "./pages/Start";

function App() {
    return (
        <Router>
            <div className="App">
                <Nav/>
                <Switch>
                    <Route path="/">
                        <Start />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

export default App;
