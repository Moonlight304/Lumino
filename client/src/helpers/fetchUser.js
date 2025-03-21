import axios from "axios";
import { toast } from "react-toastify";
import toastConfig from "../configs/toastConfig";

const server_url = import.meta.env.VITE_server_url;

export default async function fetchUser(userID) {
    try {
        const response = await axios.get(`${server_url}/users/getUser/${userID}`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}` },
        });
        return response.data.user;
    }
    catch (e) {
        console.error(e.message);
        toast.error('Oops.. an error occurred', toastConfig);
    }
}