import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { toast } from 'react-hot-toast';
import toastConfig from '../configs/toastConfig';

import { userIDState, displayNameState, avatarURLState } from '../configs/atoms';

const server_url = import.meta.env.VITE_server_url;

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [globalUserID, setGlobalUserID] = useRecoilState(userIDState);
    const [globalDisplayName, setGlobalDisplayName] = useRecoilState(displayNameState);
    const [globalAvatarURL, setGlobalAvatarURL] = useRecoilState(avatarURLState);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        display_name: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (globalUserID) {
            navigate('/discover');
        }
    }, []);


    async function handleAuthorisation(e) {
        e.preventDefault();

        try {
            if (isLogin) {
                const { email, password } = formData;

                const response = await axios.post(`${server_url}/auth/login/`, { email, password });
                const data = response.data;

                if (data.status === 'success') {
                    sessionStorage.setItem('jwt_token', data.jwt_token);
                    setGlobalUserID(data.userID);
                    setGlobalDisplayName(data.display_name);
                    setGlobalAvatarURL(data.avatarURL);

                    toast.success('Logged In', toastConfig);
                    navigate('/discover');
                }
                else {
                    toast.error(data.message, toastConfig);
                }
            }
            else {
                const { display_name, email, password, confirm_password } = formData;
                if (password !== confirm_password) {
                    toast.error('Passwords don\'t match!', toastConfig);
                    return;
                }

                console.log({ display_name, email, password });

                const response = await axios.post(`${server_url}/auth/signup/`, { display_name, email, password });
                const data = response.data;

                if (data.status === 'success') {
                    sessionStorage.setItem('jwt_token', data.jwt_token);
                    setGlobalUserID(data.userID);
                    setGlobalDisplayName(data.display_name);

                    toast.success('Signed Up', toastConfig);
                    navigate('/onboarding');
                }
                else {
                    toast.error(data.message, toastConfig);
                }
            }
        }
        catch (e) {
            toast.error('Oops try again', toastConfig);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }


    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center p-4">
            <div className="text-4xl font-bold text-primary mb-8"> <Link to={'/'}> Lumino </Link> </div>
            <div className="bg-gray-900 bg-opacity-50 p-8 max-md:px-4 max-md:py-6 rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6 text-center"> {isLogin ? 'Welcome Back' : 'Join Lumino'}  </h2>
                <form className="space-y-4" onSubmit={handleAuthorisation}>
                    {
                        !isLogin &&
                        <div className='max-md:w-full'>
                            <label htmlFor="displayName" className="block text-white mb-1">Display Name</label>
                            <input
                                type="text"
                                id="displayName"
                                name='display_name'
                                className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-primary"
                                value={formData.display_name}
                                onChange={handleChange}
                                required
                                autoComplete='true'
                            />
                        </div>
                    }

                    <div>
                        <label htmlFor="email" className="block text-white mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            name='email'
                            className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-primary"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete='true'
                        />
                    </div>
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

                    {
                        !isLogin &&
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
                    }

                    {
                        isLogin &&
                        <div className="text-right">
                            <a href="/forgot-password" className="text-sm text-primary hover:underline">
                                Forgot Password?
                            </a>
                        </div>
                    }

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-opacity-90 transition duration-300"
                    >
                        {isLogin ? 'Log In' : 'Sign up'}
                    </button>
                </form>
                <p className="mt-4 text-center text-white">
                    {
                        isLogin
                            ? <> New to Lumino? <span onClick={() => setIsLogin(false)} className="text-primary cursor-pointer hover:underline"> Sign up </span> </>
                            : <> Already have an account? <span onClick={() => setIsLogin(true)} className="text-primary cursor-pointer hover:underline"> Login </span> </>
                    }
                </p>
            </div>
        </div>
    );
}
