import { checkRefreshToken } from "@/helpers/checkRefreshToken";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        checkRefreshToken(setAuth);
    }, []);

    if (auth === null) return null;
    return auth ? children : <Navigate to="/auth" />;
}