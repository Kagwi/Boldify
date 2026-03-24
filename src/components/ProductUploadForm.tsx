// Import necessary modules
import React, { useState } from 'react';
import { uploadImage } from '../supabase';
import './ProductUploadForm.css'; // Assuming you have a CSS file for styling

const ProductUploadForm = () => {
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
            setError(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!image) {
            setError('Please upload an image.');
            return;
        }
        try {
            const { data, error } = await uploadImage(image);
            if (error) throw error;
            console.log('Image uploaded successfully:', data);
        } catch (uploadError) {
            setError('Error uploading image: ' + uploadError.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='upload-form'>
            <input type='file' onChange={handleImageChange} accept='image/*' />
            {error && <p className='error-message'>{error}</p>}
            <button type='submit'>Upload</button>
        </form>
    );
};

export default ProductUploadForm;
