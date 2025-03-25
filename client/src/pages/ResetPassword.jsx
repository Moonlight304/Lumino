import { userIDState } from "@/configs/atoms";
import toastConfig from "@/configs/toastConfig";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";

const server_url = import.meta.env.VITE_server_url;

export default function ResetPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [globalUserID] = useRecoilState(userIDState);
    const token = new URLSearchParams(window.location.search).get("token");

    useEffect(() => {
        if (globalUserID || !token || token === '') {
            navigate('/');
            toast.error('Cannot access page', toastConfig);
        }
    }, [globalUserID]);

    const [formData, setFormData] = useState({
        password: '',
        confirm_password: ''
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const navigate = useNavigate();
    async function handleResetPassword(e) {
        e.preventDefault();

        try {
            if (formData.password !== formData.confirm_password) {
                toast.error('Passwords don\'t match!', toastConfig);
                return;
            }

            const response = await axios.post(`${server_url}/auth/reset-password`, { token, password: formData.password });
            const data = response.data;

            if (data.status === "success") {
                navigate('/auth');
                toast.success('Password reset');
            }
            else {
                console.log(data.message);
                toast.error('Password reset failed');
            }
        }
        catch (e) {
            console.log(e.message);
            toast.error('Oops try again', toastConfig);
        }
    }



    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center p-4">
            <div className="text-4xl font-bold text-primary mb-8"> <Link to={'/'}> Lumino </Link> </div>
            <div className="bg-gray-900 bg-opacity-50 p-8 max-md:px-4 max-md:py-6 rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6 text-center"> Reset your password </h2>
                <form className="space-y-4" onSubmit={handleResetPassword}>

                    <div className="relative">
                        <label htmlFor="password" className="block text-white mb-1">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name='password'
                            className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-primary"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete='true'
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-10 text-gray-400"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="relative">
                        <label htmlFor="confirmPassword" className="block text-white mb-1">Confirm Password</label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name='confirm_password'
                            className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-[#FF3333]"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                            autoComplete='true'
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-10 text-gray-400"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-opacity-90 transition duration-300"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
}