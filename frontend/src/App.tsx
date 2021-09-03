import React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import './App.css';
import Nav from "./nav/Nav";

function App() {
    return (
        <Router>
            <div className="App">
                <Nav/>
                <Switch>
                    <Route path="/">
                        Test
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

export default App;
