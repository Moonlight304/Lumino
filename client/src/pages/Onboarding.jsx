import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useRecoilState } from 'recoil';
import { CgProfile } from "react-icons/cg";

import { toast } from 'react-toastify';
import toastConfig from '../configs/toastConfig';
import { countryCodes } from '../configs/countryCodes';
import { displayNameState, userIDState } from '../configs/atoms';

import handleFileChange from '../helpers/handleFileChange';

const server_url = import.meta.env.VITE_server_url;

export default function Onboarding() {
    const [globalUserID, setGlobalUserID] = useRecoilState(userIDState);
    const [globalDisplayName, setGlobalDisplayName] = useRecoilState(displayNameState);
    const [showplaystyle, setShowplaystyle] = useState(false);
    const [showConfirmplaystyle, setShowConfirmplaystyle] = useState(false);
    const [formData, setFormData] = useState({
        age: '',
        bio: '',
        profile_picture: '',
        country: '',
        gender: '',
        platform: '',
        playstyle: '',
        communication_preference: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (!globalUserID) {
            navigate('/');
        }
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleOnboarding(e) {
        e.preventDefault();

        try {
            const response = await axios.post(`${server_url}/auth/onboarding`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`,
                    },
                }
            );
            const data = response.data;

            if (data.status === 'success') {
                toast.success('Welcome to Lumino', toastConfig);
                navigate('/discover');
            }
            else {
                toast.error(data.message, toastConfig);
            }
        }
        catch (e) {
            console.log(e.message);
            toast.error('Oops.. an error occurred', toastConfig);
        }
    }


    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center p-4">
            <button onClick={() => console.log(formData)} className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-opacity-90 transition duration-300"> Click me </button>
            <div className="text-4xl font-bold text-primary mb-8"> Let's get you onboard {globalDisplayName}! </div>
            <div className="bg-gray-900 bg-opacity-50 p-8 rounded-lg w-full max-w-md">
                <form className="space-y-4" onSubmit={handleOnboarding}>
                    <div>
                        <label htmlFor="profile_picture" className="block text-white"> Upload an Avatar </label>

                        {
                            formData.profile_picture !== ''
                                ?
                                <div className='inline-block relative'>
                                    <img
                                        src={formData.profile_picture}
                                        alt="avatar_image"
                                        className="rounded-full w-40 h-40 object-cover border-2 border-gray-300 shadow-md"
                                    />

                                    <button
                                        onClick={() => setFormData((prev) => ({ ...prev, profile_picture: '' }))}
                                        style={{
                                            position: 'absolute',
                                            left: '44%',
                                            bottom: '0.5rem',
                                            border: '2px solid rgb(209 213 219 / var(--tw-border-opacity, 1))',
                                            borderRadius: '50px'
                                        }}
                                    >
                                        ❌
                                    </button>
                                </div>

                                :
                                <label htmlFor="profile_picture">
                                    <CgProfile className="cursor-pointer rounded-full w-40 h-40 object-cover border-2 border-gray-300 shadow-md" />
                                </label>
                        }
                        <input
                            type="file"
                            name='profile_picture'
                            id='profile_picture'
                            className="hidden w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-1 py-1 focus:outline-none focus:border-primary"
                            onChange={async (event) => {
                                const imageURL = await handleFileChange(event, 'avatars');
                                setFormData((prev) => ({
                                    ...prev,
                                    profile_picture: imageURL,
                                }));
                            }}
                        />
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-white"> Bio </label>
                        <textarea
                            className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-1 py-1 focus:outline-none focus:border-primary"
                            name="bio"
                            id="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="country" className="block mb-2 text-white">
                            Select a Country:
                        </label>
                        <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-primary"
                        >
                            <option value="" disabled> -- Select Country --
                            </option>
                            {Object.entries(countryCodes).map(([country, code]) => (
                                <option key={code} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>


                    <div>
                        <label className="block text-white mb-1">Gender</label>

                        <div className="flex gap-4 w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-primary">
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    id="male"
                                    value="Male"
                                    className="mr-2"
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="male" className="text-white">
                                    Male
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    id="female"
                                    value="Female"
                                    className="mr-2"
                                    onChange={handleChange}
                                />
                                <label htmlFor="female" className="text-white">
                                    Female
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    id="dont-specify"
                                    value="dont-specify"
                                    className="mr-2"
                                    onChange={handleChange}
                                />
                                <label htmlFor="dont-specify" className="text-white">
                                    Don't specify
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="age" className="block text-white mb-1"> Age </label>
                        <input
                            type='text'
                            name="age"
                            id="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            required
                            autoComplete='true'
                        />
                    </div>

                    <div>
                        <label htmlFor="platform" className="block text-white mb-1">Platform</label>
                        <select
                            name="platform"
                            id="platform"
                            value={formData.platform}
                            onChange={handleChange}
                            className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-primary"
                            required
                        >
                            <option value="" disabled>
                                -- Select your Platform --
                            </option>
                            <option value="PC"> PC </option>
                            <option value="PlayStation"> PlayStation </option>
                            <option value="Xbox"> Xbox </option>
                            <option value="Android"> Android </option>
                            <option value="IOS"> IOS </option>
                        </select>

                    </div>

                    <div>
                        <label htmlFor="playstyle" className="block text-white mb-1">Playstyle</label>
                        <select
                            name="playstyle"
                            id="playstyle"
                            value={formData.playstyle}
                            onChange={handleChange}
                            className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-primary"
                            required
                        >
                            <option value="" disabled>
                                -- Select your Playstyle --
                            </option>
                            <option value="Casual"> Casual </option>
                            <option value="Competitive"> Competitive </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-white mb-1"> Communication Preference </label>

                        <div className="flex gap-4 w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-primary">
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="communication_preference"
                                    id="voice"
                                    value="Voice"
                                    className="mr-2"
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="voice" className="text-white">
                                    Voice
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="communication_preference"
                                    id="text"
                                    value="Text"
                                    className="mr-2"
                                    onChange={handleChange}
                                />
                                <label htmlFor="text" className="text-white">
                                    Text
                                </label>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-opacity-90 transition duration-300"
                    >
                        Save
                    </button>
                </form>
            </div>
        </div>
    );
}
