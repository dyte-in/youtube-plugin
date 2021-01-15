import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';
import MainView from './MainView';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/">
                    <MainView />
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
