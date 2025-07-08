import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogContentText, TextField,
    DialogActions, Button, CircularProgress, Box
} from '@mui/material';
import { transferCourtOwnership } from '../../services/courtSerivce';
import toast from 'react-hot-toast';

interface TransferOwnershipDialogProps {
    open: boolean;
    onClose: () => void;
    courtId: string;
    courtName: string;
    onSuccess: () => void;
}

const TransferOwnershipDialog: React.FC<TransferOwnershipDialogProps> = ({ open, onClose, courtId, courtName, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleTransfer = async () => {
        if (!email) {
            toast.error("Please enter the new owner's email address.");
            return;
        }
        setIsLoading(true);
        try {
            await transferCourtOwnership(courtId, email);
            toast.success(`Ownership of ${courtName} transferred successfully!`);
            onSuccess();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const closeDialog = () => {
        if (isLoading) return;
        setEmail('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={closeDialog}>
            <DialogTitle>Transfer Ownership of "{courtName}"</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Enter the email address of the user you wish to transfer this facility to. This action is irreversible. You will lose all ownership rights.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="email"
                    label="New Owner's Email Address"
                    autoComplete='off'
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={closeDialog} disabled={isLoading}>Cancel</Button>
                <Box sx={{ position: 'relative' }}>
                    <Button
                        onClick={handleTransfer}
                        variant="contained"
                        color="primary"
                        disabled={isLoading || !email}
                    >
                        Transfer Ownership
                    </Button>
                    {isLoading && (
                        <CircularProgress
                            size={24}
                            sx={{
                                color: 'primary.main',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px',
                            }}
                        />
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default TransferOwnershipDialog;