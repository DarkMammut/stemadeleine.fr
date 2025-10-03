import './App.css';
import {BrowserRouter} from 'react-router-dom';
import Header from "./components/Header";
import useOrganizationTheme from './hooks/useOrganizationTheme';

function App() {
    // Initialize organization theme colors
    useOrganizationTheme();

    return (
        <BrowserRouter>
            <div className="App">
                <Header/>
            </div>
        </BrowserRouter>
    );
}

export default App;
