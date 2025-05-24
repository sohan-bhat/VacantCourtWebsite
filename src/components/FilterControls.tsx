import '../styles/FilterControls.css';

type FilterControlsProps = {
    filterType: string;
    setFilterType: (type: string) => void;
    viewMode: string;
    setViewMode: (mode: string) => void;
};

function FilterControls({ filterType, setFilterType, viewMode, setViewMode }: FilterControlsProps) {
    return (
        <div className="filter-controls">
            <div className="filter-types">
                <button
                    className={filterType === 'all' ? 'active' : ''}
                    onClick={() => setFilterType('all')}
                >
                    All
                </button>
                <button
                    className={filterType === 'tennis' ? 'active' : ''}
                    onClick={() => setFilterType('tennis')}
                >
                    Tennis
                </button>
                <button
                    className={filterType === 'basketball' ? 'active' : ''}
                    onClick={() => setFilterType('basketball')}
                >
                    Basketball
                </button>
                <button
                    className={filterType === 'volleyball' ? 'active' : ''}
                    onClick={() => setFilterType('volleyball')}
                >
                    Volleyball
                </button>
                <button
                    className={filterType === 'badminton' ? 'active' : ''}
                    onClick={() => setFilterType('badminton')}
                >
                    Badminton
                </button>
            </div>

            <div className="view-toggle">
                <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                    id='list-btn'
                >
                    List
                </button>
                <button
                    className={viewMode === 'map' ? 'active' : ''}
                    onClick={() => setViewMode('map')}
                >
                    Map
                </button>
            </div>
        </div>
    );
}

export default FilterControls;