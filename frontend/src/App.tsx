import Authenticated from 'auth/authenticated';
import React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import './App.css';
import Nav from "./nav/Nav";
import Start from "./pages/Start";

function App() {
    return (
        <Router>
            <div className="App px-4">
                <Nav/>
                <Switch>
                    <Route path="/">
                    <Authenticated>
                        <Start />
                    </Authenticated>
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

export default App;
