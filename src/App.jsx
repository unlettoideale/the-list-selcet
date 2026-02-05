import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PlaceDetails from './pages/PlaceDetails';
import Blog from './pages/Blog';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
    return (
        <Router>
            <div className="app-wrapper">
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/place/:id" element={<PlaceDetails />} />
                        <Route path="/editorial" element={<Blog />} />
                        <Route path="/admin" element={<Admin />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
