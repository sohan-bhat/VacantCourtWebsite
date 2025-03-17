import React, { useState, useEffect } from 'react';
import CourtList from './CourtCard';
import CourtMap from './CourtMap';
import FilterControls from './FilterControls';
import SearchBar from './SearchBar';
import '../styles/Dashboard.css';

// Mock data (replace with API calls to your backend)
const mockCourts = [
    { id: 1, name: 'Downtown Tennis Center', type: 'Tennis', available: 3, total: 6, location: 'Downtown' },
    { id: 2, name: 'Westside Basketball Courts', type: 'Basketball', available: 2, total: 4, location: 'Westside' },
    { id: 3, name: 'Southpark Volleyball', type: 'Volleyball', available: 1, total: 2, location: 'South' },
    { id: 4, name: 'Community Center Courts', type: 'Tennis', available: 0, total: 3, location: 'North' },
    { id: 5, name: 'Riverside Badminton', type: 'Badminton', available: 4, total: 4, location: 'East' },
];

function Dashboard() {
    const [courts, setCourts] = useState<{ id: number; name: string; type: string; available: number; total: number; location: string; }[]>([]);
    const [viewMode, setViewMode] = useState('list');
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Replace with your API call
        setCourts(mockCourts);
    }, []);

    const filteredCourts = courts.filter(court => {
        const matchesType = filterType === 'all' || court.type.toLowerCase() === filterType.toLowerCase();
        const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            court.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

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

            {viewMode === 'list' ? (
                <CourtList courts={filteredCourts} />
            ) : (
                <CourtMap courts={filteredCourts} />
            )}
        </div>
    );
}

export default Dashboard;