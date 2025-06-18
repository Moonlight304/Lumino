import { API } from "@/configs/api";

export async function checkRefreshToken(setAuth) {
    try {
        const res = await API('/auth/check-refresh', 'GET');
        if (res.data.tokenPresent) {
            setAuth(true);
        }
        else {
            setAuth(false);
        }
    }
    catch {
        setAuth(false);
    }
}