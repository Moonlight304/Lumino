import { toast } from 'react-hot-toast';
import toastConfig from "../configs/toastConfig";
import { API } from "@/configs/api";


export default async function fetchUser(userID, byName = false) {
    try {
        if (byName) {
            const response = await API(`/users/getUserByName/${userID}`, 'GET');
            return response.data.user;
        }
        else {
            const response = await API(`/users/getUser/${userID}`, 'GET');
            return response.data.user;
        }
    }
    catch (e) {
        console.error(e.message);
        toast.error('Oops.. an error occurred', toastConfig);
    }
}