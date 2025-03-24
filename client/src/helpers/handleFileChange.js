import axios from 'axios';
import { toast } from 'react-hot-toast';
import toastConfig from '../configs/toastConfig';

const cloud_name = import.meta.env.VITE_cloud_name;
const upload_preset = import.meta.env.VITE_upload_preset;

export default async function handleFileChange(event, folderName) {
    const file = event.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', upload_preset);
    formData.append('folder', folderName);
    formData.append('cloud_name', cloud_name);


    try {
        const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, formData);
        const imageURL = response.data.secure_url;
        
        return imageURL;
    }
    catch (e) {
        console.log(e.message);
        toast.error('Oops.. an error occurred', toastConfig);
    }
}