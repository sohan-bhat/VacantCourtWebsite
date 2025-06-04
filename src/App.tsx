import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, useMatch } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import CourtDetails from './components/courts/CourtDetails';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { Toaster } from 'react-hot-toast'
import './styles/App.css';
import AuthPage from './components/auth/AuthPage';
import Page404 from './components/layout/Page404';

const AppContent: React.FC = () => {
    const location = useLocation();

    const onDashboard = useMatch({ path: "/", end: true });
    const onCourtDetails = useMatch("/court/:id");

    const showHeaderAndFooter = !!(onDashboard || onCourtDetails);

    const isAuthPage = location.pathname === '/auth';
    const mainContentClass = `app-content ${isAuthPage ? 'auth-page-content' : ''}`;

    return (
        <div className="app-container">
            {showHeaderAndFooter && <Header />}

            <main className={mainContentClass}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/court/:id" element={<CourtDetails />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="*" element={<Page404 />} />
                </Routes>
            </main>

            {showHeaderAndFooter && <Footer />}
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