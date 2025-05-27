    import { Link } from 'react-router-dom';
    import AddCourt from '../courts/AddCourt';
    import AddIcon from '@mui/icons-material/Add'
    import { Button } from '@mui/material';
    import '../../styles/Header.css';
    import { useState } from 'react';

    function Header() {
        const [openAddCourt, setOpenAddCourt] = useState(false);
        return (
            <header className="app-header">
                <div className="header-container">
                    <nav className="main-nav">
                        <Link to="/">
                        <img src='/ground.png'/>
                            Vacant Court
                        </Link>
                    </nav>
                    <Button
                        variant="contained"
                        onClick={() => setOpenAddCourt(true)}
                        startIcon={<AddIcon />}
                    >
                        Add Court
                    </Button>
                </div>
                <AddCourt
                    open={openAddCourt}
                    onClose={() => setOpenAddCourt(false)}
                />
            </header>
        );
    }

    export default Header;