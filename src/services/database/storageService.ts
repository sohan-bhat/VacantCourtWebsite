export interface UploadProgress {
    progress: number;
    url?: string;
    error?: string;
}

export const uploadImage = async (
    file: File,
    courtName: string,
    onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
    try {
        // Create form data with correct preset name
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'vacant_court');
        formData.append('folder', `courts/${courtName}`);

        onProgress?.({ progress: 30 });

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        onProgress?.({ progress: 70 });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        onProgress?.({ progress: 100, url: data.secure_url });
        return data.secure_url;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
        onProgress?.({ progress: 0, error: errorMessage });
        throw new Error(errorMessage);
    }
};