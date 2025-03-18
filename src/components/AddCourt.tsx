import { useState, useRef } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Box,
    Typography,
    Chip,
    Alert,
    Divider,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { createDocument } from '../firebase/firestoreSerivce';
import { toast } from 'react-toastify';

interface SubCourt {
    name: string;
    surface: string;
}

interface CourtError {
    name?: string;
    surface?: string;
}

interface FormErrors {
    name?: string;
    type?: string;
    location?: string;
    address?: string;
    description?: string;
    courts?: CourtError[];
}

interface AddCourtProps {
    open: boolean;
    onClose: () => void;
}

interface CourtFormData {
    name: string;
    type: string;
    location: string;
    address: string;
    phone: string;
    hours: string;
    amenities: string[];
    courts: SubCourt[];
    description: string;
}

const initialFormData: CourtFormData = {
    name: '',
    type: '',
    location: '',
    address: '',
    phone: '',
    hours: '',
    amenities: [],
    courts: [{ name: '', surface: '' }],
    description: ''
};

export default function AddCourt({ open, onClose }: AddCourtProps) {
    const [formData, setFormData] = useState<CourtFormData>(initialFormData);
    const [amenity, setAmenity] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const basicInfoRef = useRef<HTMLDivElement>(null);
    const contactInfoRef = useRef<HTMLDivElement>(null);
    const courtsRef = useRef<HTMLDivElement>(null);
    const descriptionRef = useRef<HTMLDivElement>(null);

    const validateForm = () => {
        const newErrors: FormErrors = {};
        let hasErrors = false;
        let firstErrorRef: React.RefObject<HTMLDivElement | null> | null = null;

        if (!formData.name.trim() || !formData.type.trim() || !formData.location.trim()) {
            if (!firstErrorRef) firstErrorRef = basicInfoRef;
            if (!formData.name.trim()) newErrors.name = 'Facility name is required';
            if (!formData.type.trim()) newErrors.type = 'Sport type is required';
            if (!formData.location.trim()) newErrors.location = 'Facility location is required';
            hasErrors = true;
        }

        if (!formData.address.trim()) {
            if (!firstErrorRef) firstErrorRef = contactInfoRef;
            newErrors.address = 'Facility address is required';
            hasErrors = true;
        }

        const courtErrors: CourtError[] = [];
        let hasCourtErrors = false;

        formData.courts.forEach((court, index) => {
            const courtError: CourtError = {};

            if (!court.name.trim()) {
                if (!firstErrorRef) firstErrorRef = courtsRef;
                courtError.name = 'Court name is required';
                hasCourtErrors = true;
            }

            if (!court.surface.trim()) {
                if (!firstErrorRef) firstErrorRef = courtsRef;
                courtError.surface = 'Surface type is required';
                hasCourtErrors = true;
            }

            courtErrors[index] = courtError;
        });

        if (hasCourtErrors) {
            newErrors.courts = courtErrors;
            hasErrors = true;
        }

        if (!formData.description.trim()) {
            if (!firstErrorRef) firstErrorRef = descriptionRef;
            newErrors.description = 'Facility description is required';
            hasErrors = true;
        }

        setErrors(newErrors);

        if (firstErrorRef?.current) {
            firstErrorRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        return !hasErrors;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            await createDocument('Courts', {
                ...formData,
                isConfigured: false
            });
            toast.success('Facility added successfully!');
            onClose();
            setFormData(initialFormData);
        } catch (error) {
            console.error('Error adding facility:', error);
            toast.error('Failed to add facility. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddAmenity = () => {
        if (amenity && !formData.amenities.includes(amenity)) {
            setFormData({
                ...formData,
                amenities: [...formData.amenities, amenity]
            });
            setAmenity('');
        }
    };

    const handleAddCourt = () => {
        setFormData({
            ...formData,
            courts: [...formData.courts, { name: '', surface: '' }]
        });
    };

    const handleRemoveCourt = (index: number) => {
        const newCourts = formData.courts.filter((_, i) => i !== index);
        setFormData({ ...formData, courts: newCourts });
    };

    const renderCourts = () => {
        return formData.courts.map((court, index) => (
            <Box
                key={index}
                sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 2,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1
                }}
            >
                <TextField
                    required
                    size="small"
                    label="Court Name/Number"
                    placeholder="e.g., Court 1, Main Court"
                    value={court.name}
                    onChange={(e) => {
                        const newCourts = [...formData.courts];
                        newCourts[index].name = e.target.value;
                        setFormData({ ...formData, courts: newCourts });
                    }}
                    error={!!(errors.courts?.[index]?.name)}
                    helperText={errors.courts?.[index]?.name}
                    fullWidth
                />
                <TextField
                    required
                    size="small"
                    label="Surface Type"
                    placeholder="e.g., Hard, Clay, Grass"
                    value={court.surface}
                    onChange={(e) => {
                        const newCourts = [...formData.courts];
                        newCourts[index].surface = e.target.value;
                        setFormData({ ...formData, courts: newCourts });
                    }}
                    error={!!(errors.courts?.[index]?.surface)}
                    helperText={errors.courts?.[index]?.surface}
                    fullWidth
                />
                <IconButton
                    onClick={() => handleRemoveCourt(index)}
                    disabled={formData.courts.length === 1}
                    color="error"
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        ));
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                }
            }}
        >
            <DialogTitle sx={{
                bgcolor: '#1e3a8a',
                color: 'white',
                py: 2
            }}>
                Add New Sports Facility
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Alert severity="warning" sx={{
                    mb: 3,
                    mx: -3,
                    borderRadius: 0
                }}>
                    Note: The facility will not be visible in the application until it is configured with our hardware system.
                </Alert>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box ref={basicInfoRef}>
                        <Typography variant="h6" sx={{ color: '#1e3a8a' }} gutterBottom>
                            Facility Information
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Enter general information about your sports facility
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                required
                                label="Facility Name"
                                placeholder="e.g., Downtown Tennis Center"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    required
                                    label="Sport Type"
                                    placeholder="e.g., Tennis, Basketball"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    error={!!errors.type}
                                    helperText={errors.type}
                                    fullWidth
                                />
                                <TextField
                                    required
                                    label="Location Area"
                                    placeholder="e.g., Downtown, West Side"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    error={!!errors.location}
                                    helperText={errors.location}
                                    fullWidth
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Divider />

                    <Box ref={contactInfoRef}>
                        <Typography variant="h6" sx={{ color: '#1e3a8a' }} gutterBottom>
                            Contact Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Facility contact information for users
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                required
                                label="Facility Address"
                                placeholder="Complete street address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                error={!!errors.address}
                                helperText={errors.address}
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Contact Phone"
                                    placeholder="e.g., (555) 123-4567"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    fullWidth
                                />
                                <TextField
                                    label="Operating Hours"
                                    placeholder="e.g., 6:00 AM - 10:00 PM"
                                    value={formData.hours}
                                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                    fullWidth
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="h6" sx={{ color: '#1e3a8a' }} gutterBottom>
                            Facility Amenities
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            List available amenities at your facility (e.g., Restrooms, Water Fountains, Pro Shop)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                size="small"
                                value={amenity}
                                onChange={(e) => setAmenity(e.target.value)}
                                placeholder="Enter an amenity"
                                fullWidth
                            />
                            <Button
                                onClick={handleAddAmenity}
                                variant="contained"
                                size="small"
                                sx={{
                                    minWidth: '100px',
                                    bgcolor: '#1e3a8a',
                                    '&:hover': {
                                        bgcolor: '#1e3a8a',
                                        opacity: 0.9
                                    }
                                }}
                            >
                                Add
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {formData.amenities.map((item, index) => (
                                <Chip
                                    key={index}
                                    label={item}
                                    onDelete={() => {
                                        setFormData({
                                            ...formData,
                                            amenities: formData.amenities.filter((_, i) => i !== index)
                                        });
                                    }}
                                    sx={{
                                        bgcolor: '#1e3a8a',
                                        color: 'white',
                                        '& .MuiChip-deleteIcon': {
                                            color: 'white'
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Divider />

                    <Box ref={courtsRef}>
                        <Typography variant="h6" sx={{ color: '#1e3a8a' }} gutterBottom>
                            Individual Courts
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Add details for each individual court within your facility
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            {renderCourts()}
                        </Box>
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddCourt}
                            variant="outlined"
                            size="small"
                            sx={{
                                mb: 2,
                                borderColor: '#1e3a8a',
                                color: '#1e3a8a',
                                '&:hover': {
                                    borderColor: '#1e3a8a',
                                    bgcolor: 'rgba(30, 58, 138, 0.04)'
                                }
                            }}
                        >
                            Add Another Court
                        </Button>
                    </Box>

                    <Divider />

                    <Box ref={descriptionRef}>
                        <Typography variant="h6" sx={{ color: '#1e3a8a' }} gutterBottom>
                            Facility Description
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Provide a detailed description of your facility and its features
                        </Typography>
                        <TextField
                            required
                            multiline
                            rows={4}
                            placeholder="Describe your facility's features, atmosphere, and any special characteristics"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            error={!!errors.description}
                            helperText={errors.description}
                            fullWidth
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={isSubmitting}
                    sx={{
                        mr: 1,
                        borderColor: '#1e3a8a',
                        color: '#1e3a8a',
                        '&:hover': {
                            borderColor: '#1e3a8a',
                            bgcolor: 'rgba(30, 58, 138, 0.04)'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                        px: 4,
                        bgcolor: '#1e3a8a',
                        '&:hover': {
                            bgcolor: '#1e3a8a',
                            opacity: 0.9
                        }
                    }}
                >
                    {isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        'Add Facility'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}