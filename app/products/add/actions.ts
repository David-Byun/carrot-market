'use server';

export async function uploadProduct(formData: FormData) {
  const data = {
    title: formData.get('title'),
    photo: formData.get('photo'),
    description: formData.get('price'),
    price: formData.get('description'),
  };
  console.log(data);
}
