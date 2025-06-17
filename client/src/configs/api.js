import axios from "axios";

const server_url = import.meta.env.VITE_server_url;

export async function API(route, req_type, data = null, options = {}) {
    try {
        let token = localStorage.getItem("access_token");

        // Determine if the request contains FormData
        // const isFormData = data instanceof FormData;

        const headers = {
            Authorization: token ? `Bearer ${token}` : "",
            // ...(isFormData ? {} : { "Content-Type": "application/json" }),
        };

        const response = await axios({
            method: req_type,
            url: `${server_url}${route}`,
            ...(data && req_type !== "DELETE" ? { data } : {}),
            withCredentials: true,
            headers,
            ...options,
        });

        // Check if response should be treated as a blob file
        // if (options.responseType === "blob") {
        //     return response.data; // Directly return blob data
        // }

        return response;
    }
     catch (error) {
        if (error.response?.status === 401) {
            try {
                const refreshResponse = await axios.post(
                    `${server_url}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                console.log(refreshResponse);
                const newAccessToken = refreshResponse.data.access_token;
                localStorage.setItem("access_token", newAccessToken);

                return await API(route, req_type, data, options);
            }
            catch (refreshError) {
                console.error("Token refresh failed:", refreshError.response?.data || refreshError.message);
                localStorage.removeItem("access_token");
                // localStorage.removeItem("UserID");
                // localStorage.removeItem("EmpID");
                // localStorage.removeItem("Name");
                // localStorage.removeItem("DepartmentID");
                // localStorage.removeItem("RoleID");
                // localStorage.removeItem("Email");
                // localStorage.removeItem("DepartmentName");

                // window.location.href = "/";
                throw refreshError;
            }
        }

        console.error("API Error:", error.response?.data || error.message);
        throw error;
    }
}
