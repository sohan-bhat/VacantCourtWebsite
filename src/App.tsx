import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import CourtDetails from './components/courts/CourtDetails';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { Toaster } from 'react-hot-toast'
import './styles/App.css';
import AuthPage from './components/auth/AuthPage';

const AppContent: React.FC = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/auth';

    return (
        <div className="app-container">
            {!isAuthPage && <Header />}

            <main className={`app-content ${isAuthPage ? 'auth-page-content' : ''}`}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/court/:id" element={<CourtDetails />} />
                    <Route path="/auth" element={<AuthPage />} />
                </Routes>
            </main>

            {!isAuthPage && <Footer />}
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
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