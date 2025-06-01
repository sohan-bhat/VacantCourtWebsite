import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import CourtDetails from './components/courts/CourtDetails';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { Toaster } from 'react-hot-toast'
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
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    success: {
                        iconTheme: { primary: 'green', secondary: 'white' },
                    },
                    error: {
                        iconTheme: { primary: 'red', secondary: 'white' },
                    },
                }}
            />
        </Router>
    );
}

export default App;