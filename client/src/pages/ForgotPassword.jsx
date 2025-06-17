import toastConfig from "@/configs/toastConfig";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const server_url = import.meta.env.VITE_server_url;

export default function ForgotPassword() {
    const [email, setEmail] = useState('');


    async function handleForgotPassword(e) {
        e.preventDefault();

        try {
            const response = await axios.post(`${server_url}/auth/forgot-password`, { email });
            const data = response.data;

            if (data.status === "success") {
                toast.success(`Sent mail to ${data.email}`, toastConfig);
            }
            else {
                console.log(data.message);
                toast.error('Failed to verify email', toastConfig);
            }
        }
        catch (e) {
            console.log(e.message);
            toast.error('Oops try again', toastConfig);
        }
    }

    const navigate = useNavigate();
    useEffect(() => {
        if (globalUserID) {
            navigate('/');
            toast.error('Cannot access page', toastConfig);
        }

    }, [globalUserID, navigate]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center p-4">
            <div className="text-4xl font-bold text-primary mb-8"> <Link to={'/'}> Lumino </Link> </div>
            <div className="bg-gray-900 bg-opacity-50 p-8 max-md:px-2 max-md:py-8 rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6 text-center"> Reset your password </h2>
                <form className="space-y-4" onSubmit={handleForgotPassword}>

                    <div>
                        <label htmlFor="email" className="block text-white mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            name='email'
                            className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-primary"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete='true'
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-opacity-90 transition duration-300"
                    >
                        Send Verification Email
                    </button>
                </form>
            </div>
        </div>
    );
}