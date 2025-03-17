import React, { useState, useEffect } from 'react';
import CourtList from './CourtCard';
import CourtMap from './CourtMap';
import FilterControls from './FilterControls';
import SearchBar from './SearchBar';
import '../styles/Dashboard.css';
import { dashboardCourts, CourtSummary } from '../data/courtData';

function Dashboard() {
    const [courts, setCourts] = useState<CourtSummary[]>([]);
    const [viewMode, setViewMode] = useState('list');
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Simulate an API call delay
        setTimeout(() => {
            setCourts(dashboardCourts);
        }, 500);
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

            <FilterControls filterType={filterType} setFilterType={setFilterType} viewMode={viewMode} setViewMode={setViewMode} />

            {viewMode === 'list' ? (
                <CourtList courts={filteredCourts} />
            ) : (
                <CourtMap courts={filteredCourts} />
            )}
        </div>
    );
}

export default Dashboard;