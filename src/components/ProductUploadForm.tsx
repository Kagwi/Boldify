import React, { useState } from 'react';
import { supabase } from '../client'; // Adjust the path as necessary

const ProductUploadForm = () => {
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState(null);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return;

        // Upload image to Supabase
        const { data, error: uploadError } = await supabase.storage.from('products').upload(image.name, image);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            return;
        }

        const imageUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/products/${image.name}`;

        // Save product data to database
        const { error: dbError } = await supabase.from('products').insert([{
            name: productName,
            description,
            price,
            category,
            image_url: imageUrl
        }]);

        if (dbError) {
            console.error('Error saving product:', dbError);
        } else {
            alert('Product uploaded successfully!');
            // Reset form
            setProductName('');
            setDescription('');
            setPrice('');
            setCategory('');
            setImage(null);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} required />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
            <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
            <input type="file" accept="image/*" onChange={handleImageChange} required />
            <button type="submit">Upload Product</button>
        </form>
    );
};

export default ProductUploadForm;