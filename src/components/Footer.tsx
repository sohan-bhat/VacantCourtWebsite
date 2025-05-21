import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} Vacant Court App</p>
      </div>
    </footer>
  );
}

export default Footer;