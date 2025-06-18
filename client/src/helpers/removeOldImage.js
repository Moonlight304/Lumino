import { API } from "@/configs/api";
import toast from "react-hot-toast";
import toastConfig from '../configs/toastConfig';

function extractPublicId(url) {
    if (!url) return null;
    const parts = url.split('/');
    const last = parts.pop().split('.')[0];
    const folder = parts[parts.length - 1];
    return `${folder}/${last}`;
}

export default async function removeOldImage(prevImageURL) {
    if (!prevImageURL || prevImageURL === "") return;

    try {

        const public_id = extractPublicId(prevImageURL);
        const response = await API('/images/delete', 'POST', { public_id });
    }
    catch (e) {
        console.log(e.message);
        toast.error('Oops.. an error occurred', toastConfig);
    }
}