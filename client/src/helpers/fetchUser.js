import axios from "axios";
import { toast } from 'react-hot-toast';
import toastConfig from "../configs/toastConfig";

const server_url = import.meta.env.VITE_server_url;

export default async function fetchUser(userID, byName = false) {
    try {
        if (byName) {
            const response = await axios.get(`${server_url}/users/getUserByName/${userID}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}` },
            });
            return response.data.user;
        }
        else {
            const response = await axios.get(`${server_url}/users/getUser/${userID}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}` },
            });
            return response.data.user;
        }
    }
    catch (e) {
        console.error(e.message);
        toast.error('Oops.. an error occurred', toastConfig);
    }
}