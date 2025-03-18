import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CourtDetails from './components/CourtDetails';
import Header from './components/Header';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Header />

                <main className="app-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/court/:id" element={<CourtDetails />} />
                    </Routes>
                </main>

                <Footer />
            </div>
            <ToastContainer
                position="top-left"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                theme="colored"
            />
        </Router>
    );
}

export default App;