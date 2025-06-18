import axios from "axios";

const server_url = import.meta.env.VITE_server_url;

export async function API(route, req_type, data = null, options = {}) {
    try {
        let token = localStorage.getItem("access_token");

        const headers = {
            Authorization: token ? `Bearer ${token}` : "",
        };

        const response = await axios({
            method: req_type,
            url: `${server_url}${route}`,
            ...(data && req_type !== "DELETE" ? { data } : {}),
            withCredentials: true,
            headers,
            ...options,
        });

        return response;
    }
    catch (error) {
        if (error.response?.status === 401) {

            try {
                console.log('ERROR')
                console.log(error)
                const refreshResponse = await axios.get(
                    `${server_url}/auth/refresh`,
                    { withCredentials: true }
                );

                console.log(refreshResponse.data);

                const newAccessToken = refreshResponse.data.access_token;
                localStorage.setItem("access_token", newAccessToken);

                console.log('REFRESHED')


                return await API(route, req_type, data, options);
            }
            catch (refreshError) {
                console.error("Token refresh failed:", refreshError.response?.data || refreshError.message);
                localStorage.removeItem("access_token");
          
                throw refreshError;
            }
        }

        console.error("API Error:", error.response?.data || error.message);
        throw error;
    }
}
