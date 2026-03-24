import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  subcategory_id: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Add this to your src/lib/supabase.ts

// Upload an image file to Supabase Storage
export async function uploadImage(file: File, bucketName: string = 'product-images'): Promise<string | null> {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get the public URL
    const { data: publicUrl } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    return null;
  }
}

// Delete an image from storage
export async function deleteImage(imagePath: string, bucketName: string = 'product-images'): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([imagePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Image deletion failed:', error);
    return false;
  }
}
