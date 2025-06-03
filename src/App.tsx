import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import CourtDetails from './components/courts/CourtDetails';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import './styles/App.css';
import AuthPage from './components/auth/AuthPage';
import Page404 from './components/layout/Page404';

const LayoutWithHeaderFooter: React.FC = () => {
    return (
        <div className="app-container">
            <Header />
            <main className="app-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

const LayoutWithoutHeaderFooter: React.FC = () => {
    return (
        <div className="app-container full-page-container">
            <main className="app-content full-page-content">
                <Outlet />
            </main>
        </div>
    );
};

function App() {
    return (
        <Router>
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

            <Routes>
                <Route element={<LayoutWithHeaderFooter />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/court/:id" element={<CourtDetails />} />
                </Route>

                <Route element={<LayoutWithoutHeaderFooter />}>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="*" element={<Page404 />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;