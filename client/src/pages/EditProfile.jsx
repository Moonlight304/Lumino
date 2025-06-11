import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Save, Upload } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import toastConfig from '@/configs/toastConfig';
import Navbar from '@/components/Navbar';
import fetchUser from '@/helpers/fetchUser';
import { countryCodes } from '@/configs/countryCodes';
import { useRecoilState } from 'recoil';
import { displayNameState, userIDState } from '@/configs/atoms';
import { CgProfile } from 'react-icons/cg';
import handleFileChange from '@/helpers/handleFileChange';
import { useNavigate } from 'react-router-dom';

const server_url = import.meta.env.VITE_server_url;

export default function EditProfile({ onProfileUpdate }) {
    const [globalUserID, setGlobalUserID] = useRecoilState(userIDState);
    const [globalDisplayName] = useRecoilState(displayNameState);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        age: "",
        bio: "",
        profile_picture: "",
        country: "",
        gender: "",
        platform: "",
        playstyle: "",
        communication_preference: "",
        steam_id: "",
        discord_username: "",
        favourite_games: "",
        favourite_genres: ""
    });


    useEffect(() => {
        async function getUser() {
            try {
                const response = await axios.get(`${server_url}/users/me`, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}` },
                });
                const fetchedUser = response.data.user;

                setUser(fetchedUser);
                setFormData({
                    display_name: fetchedUser?.display_name || '',
                    bio: fetchedUser?.bio || '',
                    country: fetchedUser?.country || '',
                    age: fetchedUser?.age || 0,
                    gender: fetchedUser?.gender || 'dont-specify',
                    favourite_games: fetchedUser?.favourite_games?.join(", ") || "",
                    favourite_genres: fetchedUser?.favourite_genres?.join(", ") || "",
                    platform: fetchedUser?.platform || '',
                    playstyle: fetchedUser?.playstyle || '',
                    communication_preference: fetchedUser?.communication_preference || '',
                    discord_username: fetchedUser?.discord_username || '',
                    steam_id: fetchedUser?.steam_id || '',
                    profile_picture: fetchedUser?.profile_picture || '',
                });
            }
            catch (e) {
                console.error(e.message);
                toast.error('Oops.. an error occurred', toastConfig);
            }
            finally {
                setIsLoading(false);
            }
        }

        getUser();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const navigate = useNavigate();

    async function handleEditProfile(e) {
        e.preventDefault();

        try {
            const response = await axios.post(`${server_url}/users/edit_user/${globalUserID}`, formData, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const data = response.data;

            if (data.status === 'success') {
                toast.success('Profile updated successfully', toastConfig);
                navigate(`/user/${globalDisplayName}`);
            }
        }
        catch (error) {
            console.log(error.message)
            toast.error('Failed to update profile', toastConfig);
        }
    };

    useEffect(() => {
        if (!globalUserID) {
            navigate('/');
            toast.error('Cannot access page', toastConfig);
        }
    }, [globalUserID]);

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                <Card className="w-full max-w-2xl bg-gray-900 shadow-lg border border-red-500">
                    <CardHeader className="text-center">
                        <CardTitle className="text-4xl text-red-500"> Edit Your Profile {globalDisplayName} </CardTitle>
                    </CardHeader>
                    <CardContent className={'max-md:px-2'}>
                        <form onSubmit={handleEditProfile} className="space-y-6">
                            {/* Profile Picture */}
                            <div className="flex flex-col items-center space-y-4">
                                <Label htmlFor="profile_picture" className="text-red-400">Profile Picture</Label>
                                <label htmlFor="profile_picture" className="cursor-pointer">

                                    {formData.profile_picture ? (
                                        <div className="relative w-36 h-36 rounded-full border-4 border-red-500 flex items-center justify-center">
                                            <img src={formData.profile_picture} alt="Profile" className="w-full h-full rounded-full object-cover" />

                                            <button
                                                onClick={() => setFormData((prev) => ({ ...prev, profile_picture: '' }))}
                                                className="absolute bottom-1 border-2 border-white rounded-full"
                                            >
                                                ❌
                                            </button>
                                        </div>

                                    ) : (
                                        <div className="w-32 h-32 rounded-full border-4 border-red-500 flex items-center justify-center">
                                            <CgProfile className="w-20 h-20 text-red-500" />
                                        </div>
                                    )}


                                </label>
                                <input
                                    type="file"
                                    id="profile_picture"
                                    className="hidden"
                                    onChange={async (event) => {
                                        const imageURL = await handleFileChange(event, "avatars");
                                        setFormData((prev) => ({ ...prev, profile_picture: imageURL }));
                                    }}
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <Label htmlFor="bio" className="text-white">Bio</Label>
                                <Textarea id="bio" name="bio" placeholder="Tell us about yourself..." value={formData.bio} onChange={handleChange} className="bg-gray-800 border-red-500 text-white" />
                            </div>

                            {/* Age & Gender */}
                            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                                <div>
                                    <Label htmlFor="age" className="text-white">Age</Label>
                                    <Input type="number" id="age" name="age" placeholder="Enter your age" value={formData.age} onChange={handleChange} className="bg-gray-800 border-red-500 text-white" />
                                </div>

                                <div>
                                    <Label htmlFor="gender" className="text-white">Gender</Label>
                                    <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))} value={formData.gender} >
                                        <SelectTrigger className='bg-gray-800 text-white border-red-500'>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="dont-specify">Don't Specify</SelectItem>
                                        </SelectContent>
                                    </Select>

                                </div>
                            </div>

                            {/* communication_pref & country */}
                            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                                <div>
                                    <Label htmlFor="communication_preference" className="text-white">Communication Preference</Label>
                                    <Select
                                        value={formData.communication_preference}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, communication_preference: value }))}
                                    >
                                        <SelectTrigger className='bg-gray-800 text-white border-red-500'>
                                            <SelectValue placeholder="Select preference" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Any">Any</SelectItem>
                                            <SelectItem value="Voice">Voice Chat</SelectItem>
                                            <SelectItem value="Text">Text Chat</SelectItem>
                                            <SelectItem value="Both">Both</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="country" className="text-white">Country</Label>
                                    <Select value={formData.country} onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))} >
                                        <SelectTrigger className='bg-gray-800 text-white border-red-500'>
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(countryCodes).map(([country, code]) => (
                                                <SelectItem key={code} value={country}>
                                                    {country}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* platform & playstyle */}
                            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                                <div>
                                    <Label htmlFor="platform" className="text-white">Platform</Label>
                                    <Select value={formData.platform} onValueChange={(value) => setFormData((prev) => ({ ...prev, platform: value }))}>
                                        <SelectTrigger className='bg-gray-800 text-white border-red-500'>
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Any">Any</SelectItem>
                                            <SelectItem value="PC">PC</SelectItem>
                                            <SelectItem value="PlayStation">PlayStation</SelectItem>
                                            <SelectItem value="Xbox">Xbox</SelectItem>
                                            <SelectItem value="Android">Android</SelectItem>
                                            <SelectItem value="IOS">IOS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="playstyle" className="text-white">Playstyle</Label>
                                    <Select value={formData.playstyle} onValueChange={(value) => setFormData((prev) => ({ ...prev, playstyle: value }))}>
                                        <SelectTrigger className='bg-gray-800 text-white border-red-500'>
                                            <SelectValue placeholder="Select playstyle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Any">Any</SelectItem>
                                            <SelectItem value="Casual">Casual</SelectItem>
                                            <SelectItem value="Competitive">Competitive</SelectItem>
                                            <SelectItem value="Mixed">Mixed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="steam_id" className="text-white"> Steam ID </Label>
                                <Input
                                    id="steam_id"
                                    name="steam_id"
                                    value={formData.steam_id}
                                    onChange={handleChange}
                                    placeholder="Enter your Steam ID"
                                    className='bg-gray-800 text-white border-red-500'
                                />
                            </div>

                            <div>
                                <Label htmlFor="discord_username" className="text-white"> Discord Username </Label>
                                <Input
                                    id="discord_username"
                                    name="discord_username"
                                    value={formData.discord_username}
                                    onChange={handleChange}
                                    placeholder="Enter your Discord Username"
                                    className='bg-gray-800 text-white border-red-500'
                                />
                            </div>


                            <div>
                                <Label htmlFor="favourite_games" className="text-white">Favourite Games</Label>
                                <Input
                                    id="favourite_games"
                                    name="favourite_games"
                                    value={formData.favourite_games}
                                    onChange={handleChange}
                                    placeholder="Comma separated games"
                                    className='bg-gray-800 text-white border-red-500'
                                />
                            </div>

                            <div>
                                <Label htmlFor="favourite_genres" className="text-white">Favourite Genres</Label>
                                <Input
                                    id="favourite_genres"
                                    name="favourite_genres"
                                    value={formData.favourite_genres}
                                    onChange={handleChange}
                                    placeholder="Comma separated genres"
                                    className='bg-gray-800 text-white border-red-500'
                                />
                            </div>


                            <Button type="submit" className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                Save
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}