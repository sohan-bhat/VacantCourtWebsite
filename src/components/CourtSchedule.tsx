import React from 'react';
import '../styles/CourtSchedule.css';

interface Court {
    id: number;
    name: string;
    surface: string;
    status: 'available' | 'in-use' | 'maintenance';
    nextAvailable: string;
}

interface CourtScheduleProps {
    courts: Court[];
    date: string;
}

function CourtSchedule({ courts }: CourtScheduleProps) {
    return (
        <div className="courts-list">
            {courts.map(court => (
                <div key={court.id} className={`court-item ${court.status}`}>
                    <div className="court-item-info">
                        <h4>{court.name}</h4>
                        <p className="court-surface">{court.surface}</p>
                        <p className={`court-status ${court.status}`}>
                            {court.status === 'available' ? 'Available' :
                                court.status === 'in-use' ? 'In Use' : 'Maintenance'}
                        </p>
                        <p className="next-available">Next available: {court.nextAvailable}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default CourtSchedule;