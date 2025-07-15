import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, useMatch } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import CourtDetails from './components/courts/CourtDetails';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { Toaster } from 'react-hot-toast'
import './styles/App.css';
import AuthPage from './components/auth/AuthPage';
import Page404 from './components/layout/Page404';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsOfService from './components/pages/TermsOfService';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AccountPage from './components/account/AccountPage';
import ProfileSettings from './components/account/ProfileSettings';
import SubscriptionManager from './components/account/SubscriptionManager';
import SplashPage from './components/pages/SplashPage';

const AppContent: React.FC = () => {
    const location = useLocation();

    const onSplashPage = useMatch({ path: "/", end: true })
    const onDashboard = useMatch("/dashboard");
    const onCourtDetails = useMatch("/court/:id");
    const onPrivacyPolicy = useMatch("/privacy")
    const onTermsOfService = useMatch("/tos")

    const onAccountPage = useMatch("/account/*");

    const showHeaderAndFooter = !!(onDashboard || onCourtDetails || onPrivacyPolicy || onTermsOfService) && !onAccountPage;

    const mainContentClass = onAccountPage || onSplashPage || onTermsOfService || onPrivacyPolicy ? 'app-content full-width-content' : `app-content ${location.pathname === '/auth' ? 'auth-page-content' : ''}`;

    return (
        <div className="app-container">
            {showHeaderAndFooter && <Header />}

            <main className={mainContentClass}>
                <Routes>
                    <Route path="/" element={<SplashPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/court/:id" element={<CourtDetails />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/tos" element={<TermsOfService />} />

                    <Route path="/account" element={<ProtectedRoute />}>
                        <Route element={<AccountPage />}>
                            <Route index element={<ProfileSettings />} />
                            <Route path="profile" element={<ProfileSettings />} />
                            <Route path="subscriptions" element={<SubscriptionManager />} />
                        </Route>
                    </Route>

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