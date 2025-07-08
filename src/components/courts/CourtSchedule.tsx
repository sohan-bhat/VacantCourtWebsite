import '../../styles/courts/CourtSchedule.css';

interface SubCourtForSchedule {
    id: number | string;
    name: string;
    surface: string;
    status: 'available' | 'in-use' | 'maintenance';
    isConfigured: boolean;
}

interface CourtScheduleProps {
    courts: SubCourtForSchedule[];
}

function CourtSchedule({ courts }: CourtScheduleProps) {
    return (
        <div className="courts-list">
            {courts.map((court, key) => {
                let displayStatusText = '';
                let statusClassName = '';

                if (!court.isConfigured) {
                    displayStatusText = 'Not Configured';
                    statusClassName = 'not-configured';
                } else {
                    switch (court.status) {
                        case 'available':
                            displayStatusText = 'Available';
                            statusClassName = 'available';
                            break;
                        case 'in-use':
                            displayStatusText = 'In Use';
                            statusClassName = 'in-use';
                            break;
                        case 'maintenance':
                            displayStatusText = 'Maintenance';
                            statusClassName = 'maintenance';
                            break;
                        default:
                            displayStatusText = 'Unknown';
                            statusClassName = 'unknown';
                    }
                }

                return (
                    <div key={key} className={`court-item ${statusClassName}`}>
                        <div className="court-item-info">
                            <h4>{court.name}</h4>
                            {court.surface ? <p style={{fontFamily: 'Rubik'}}className="court-surface">{court.surface} court</p> : null}
                            <p style={{fontFamily: 'Rubik'}}className={`court-status-text ${statusClassName}`}>
                                {displayStatusText}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default CourtSchedule;