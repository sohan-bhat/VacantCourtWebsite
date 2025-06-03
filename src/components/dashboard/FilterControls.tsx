import '../../styles/dashboard/FilterControls.css';
import { Switch, FormControlLabel, Tooltip, useTheme } from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';


type FilterControlsProps = {
    filterType: string;
    setFilterType: (type: string) => void;
    viewMode: string;
    setViewMode: (mode: string) => void;
    showOnlyConfigured: boolean;
    setShowOnlyConfigured: (show: boolean) => void;
};

function FilterControls({
    filterType,
    setFilterType,
    viewMode,
    setViewMode,
    showOnlyConfigured,
    setShowOnlyConfigured
}: FilterControlsProps) {
    const theme = useTheme();

    const handleConfiguredFilterToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowOnlyConfigured(event.target.checked);
    };

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
                <Tooltip title={showOnlyConfigured ? "Showing only facilities with configured courts" : "Showing all facilities"}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showOnlyConfigured}
                                onChange={handleConfiguredFilterToggle}
                                color="primary"
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: theme.palette.success.main, 
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: theme.palette.success.light,
                                    },
                                }}
                            />
                        }
                        labelPlacement="start"
                        label={showOnlyConfigured ? <SettingsSuggestIcon sx={{ color: theme.palette.success.main, fontSize: '1.3rem', mt: '4px' }} /> : <SettingsSuggestIcon sx={{color: theme.palette.grey[600], fontSize: '1.3rem', mt: '4px' }} />}
                        sx={{
                            mr: { xs: 0, sm: 1 },
                            border: `1px solid ${showOnlyConfigured ? theme.palette.success.light : theme.palette.grey[300]}`,
                            borderRadius: theme.shape.borderRadius,
                            py: 0.25,
                            px: 0.75,
                            bgcolor: showOnlyConfigured ? theme.palette.success.light + '1A' : theme.palette.grey[100],
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                cursor: 'pointer',
                                bgcolor: showOnlyConfigured ? theme.palette.success.light + '33' : theme.palette.grey[200],
                            },
                            '& .MuiFormControlLabel-label': {
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                color: showOnlyConfigured ? theme.palette.success.dark : theme.palette.text.secondary,
                                lineHeight: 1
                            },
                        }}
                    />
                </Tooltip>
            </div>

            <div className="view-and-config-controls">
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
        </div>
    );
}

export default FilterControls;