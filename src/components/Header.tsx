import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
    return (
        <header className="app-header">
            <div className="header-container">
                <nav className="main-nav">
                    <Link to="/">
                        Vacant Court
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Header;