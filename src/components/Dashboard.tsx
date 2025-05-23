import { useState, useEffect } from 'react';
import CourtCard from './CourtCard';
import CourtMap from './CourtMap';
import FilterControls from './FilterControls';
import SearchBar from './SearchBar';
import '../styles/Dashboard.css';
import { subscribeToCourtsSummary, CourtCardSummary } from '../data/courtData'; 

function Dashboard() {
    const [courts, setCourts] = useState<CourtCardSummary[]>([]);
    const [viewMode, setViewMode] = useState('list');
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const unsubscribe = subscribeToCourtsSummary(
            (fetchedCourtsSummary) => {
                setCourts(fetchedCourtsSummary);
                setLoading(false);
            },
            (err) => {
                console.error("Failed to subscribe to court updates:", err);
                setError("Failed to load court data. Please try again later.");
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, []);

    const filteredCourts = courts.filter(court => {
        const matchesType = filterType === 'all' || (court.type && court.type.toLowerCase() === filterType.toLowerCase());
        const matchesSearch = (court.name && court.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (court.location && court.location.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesType && matchesSearch;
    });
    
    if (error) {
        return <div className="dashboard-error">{error}</div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Available Courts</h2>
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>

            <FilterControls
                filterType={filterType}
                setFilterType={setFilterType}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            {viewMode === 'list' ? <CourtCard courts={filteredCourts} loading={loading} /> : <CourtMap courts={filteredCourts} />}
        </div>
    );
}

export default Dashboard;