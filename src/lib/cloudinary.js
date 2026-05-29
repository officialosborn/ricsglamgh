const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error('Image upload failed')
  const data = await res.json()
  return { url: data.secure_url, public_id: data.public_id }
}

export async function deleteImage(publicId) {
  // Deletion from frontend requires signed requests — handle via Supabase Edge Function or just orphan cleanup
  // For now we store public_id and can batch delete from Cloudinary dashboard
  console.log('Image to delete:', publicId)
}
