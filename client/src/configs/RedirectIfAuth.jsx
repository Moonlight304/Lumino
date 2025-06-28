import { checkRefreshToken } from "@/helpers/checkRefreshToken";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function RedirectIfAuth({ children }) {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        checkRefreshToken(setAuth);
    }, []);

    if (auth === null)
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-6">
                    {/* Logo */}
                    <img
                        src="/favicon.png"
                        alt="Loading logo"
                        className="w-16 h-16"
                    />

                    {/* Equalizer (fixed height) */}
                    <div className="flex items-center h-10 space-x-4">
                        <div className="w-1 h-6 bg-red-500 animate-bar1 origin-center"></div>
                        <div className="w-1 h-6 bg-red-500 animate-bar2 origin-center"></div>
                        <div className="w-1 h-6 bg-red-500 animate-bar3 origin-center"></div>
                        <div className="w-1 h-6 bg-red-500 animate-bar2 origin-center"></div>
                        <div className="w-1 h-6 bg-red-500 animate-bar1 origin-center"></div>
                    </div>

                    {/* Animation styles */}
                    <style>{`
                        @keyframes bar1 {
                            0%, 100% { transform: scaleY(0.6); }
                            50% { transform: scaleY(1.8); }
                        }
                        @keyframes bar2 {
                            0%, 100% { transform: scaleY(0.8); }
                            50% { transform: scaleY(1.4); }
                        }
                        @keyframes bar3 {
                            0%, 100% { transform: scaleY(1); }
                            50% { transform: scaleY(1.8); }
                        }

                        .animate-bar1 {
                            animation: bar1 1s ease-in-out infinite;
                        }
                        .animate-bar2 {
                            animation: bar2 1s ease-in-out infinite;
                        }
                        .animate-bar3 {
                            animation: bar3 1s ease-in-out infinite;
                        }
                    `}</style>
                </div>
            </div>
        );

    return auth ? <Navigate to="/discover" /> : children;
}
