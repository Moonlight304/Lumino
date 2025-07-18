import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import toastConfig from '@/configs/toastConfig';
import { countryNameToCode } from '@/configs/countryNameToCode';
import { useRecoilState } from 'recoil';
import { displayNameState, userIDState } from '@/configs/atoms';
import { CgProfile } from 'react-icons/cg';
import { useNavigate } from 'react-router-dom';
import { API } from '@/configs/api';
import Loading from '@/components/Loading';
import removeOldImage from '@/helpers/removeOldImage';
import ButtonLoader from '@/helpers/ButtonLoader';


export default function EditProfile({ onProfileUpdate }) {
    const [globalUserID, setGlobalUserID] = useRecoilState(userIDState);
    const [globalDisplayName] = useRecoilState(displayNameState);
    const [isLoading, setIsLoading] = useState(true);
    const [editIsLoading, setEditIsLoading] = useState(false);
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
    const [imageFile, setImageFile] = useState(null);
    const [oldImageURL, setOldImageURL] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        async function getUser() {
            setIsLoading(true);

            try {
                const response = await API('/users/me', 'GET');
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
                setOldImageURL(fetchedUser?.profile_picture);
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


    async function handleEditProfile(e) {
        e.preventDefault();
        setEditIsLoading(true);

        let updatedProfilePicture = formData.profile_picture;

        try {
            // If user selected a new image
            if (imageFile) {
                // Remove old image if it exists
                if (oldImageURL) {
                    await removeOldImage(oldImageURL);
                }

                const form = new FormData();
                form.append('imageFile', imageFile);

                // Send folder as query param
                const imageURLResponse = await API('/images/upload?folder=avatars', 'POST', form);

                updatedProfilePicture = imageURLResponse.data.secure_url;
            }
            // If user removed profile picture, clicked x
            else if (formData.profile_picture === "" && oldImageURL !== "") {
                await removeOldImage(oldImageURL);
                updatedProfilePicture = '';
            }

            const updatedFormData = {
                ...formData,
                profile_picture: updatedProfilePicture,
            };

            const response = await API(`/users/edit_user/${globalUserID}`, 'POST', updatedFormData);
            const data = response.data;

            if (data.status === 'success') {
                toast.success('Profile updated successfully', toastConfig);
                localStorage.removeItem('access_token');
                navigate(`/user/${globalDisplayName}`);
            }
        }
        catch (error) {
            console.log(error.message);
            toast.error('Failed to update profile', toastConfig);
        }
        finally {
            setEditIsLoading(false);
        }
    }


    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                {
                    isLoading
                        ?
                        <Loading />
                        :
                        (
                            <Card className="w-full max-w-2xl bg-gray-900 shadow-lg border border-transparent">
                                <CardHeader className="text-center">
                                    <CardTitle className="text-4xl text-white"> Edit Your Profile {globalDisplayName} </CardTitle>
                                    {/* <Button onClick={() => console.log(imageFile)}> Image FILE </Button>
                                    <Button onClick={() => console.log(formData)}> Form Data </Button>
                                    <Button onClick={() => console.log(oldImageURL)}> OLD </Button>
                                    <Button onClick={() => console.log(formData.profile_picture === "" && oldImageURL !== "")}> CLICK ME </Button> */}
                                </CardHeader>
                                <CardContent className={'max-md:px-2'}>
                                    <form onSubmit={handleEditProfile} className="space-y-6">
                                        {/* Profile Picture */}
                                        <div className="flex flex-col items-center space-y-4">
                                            <Label htmlFor="profile_picture" className="text-red-400">Profile Picture</Label>
                                            <div className="relative w-36 h-36 flex items-center justify-center">
                                                <label htmlFor="profile_picture" className="cursor-pointer w-full h-full">
                                                    {formData.profile_picture ? (
                                                        <img src={formData.profile_picture} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-red-500" />
                                                    ) : (
                                                        <div className="w-32 h-32 rounded-full border-4 border-red-500 flex items-center justify-center">
                                                            <CgProfile className="w-20 h-20 text-red-500" />
                                                        </div>
                                                    )}
                                                </label>
                                                {formData.profile_picture && (
                                                    <button
                                                        onClick={() => {
                                                            setImageFile(null);
                                                            setFormData((prev) => ({ ...prev, profile_picture: '' }));
                                                            // setOldImageURL(null);
                                                        }}
                                                        className="absolute bottom-1 border-2 border-white rounded-full p-1 bg-black"
                                                        type="button"
                                                    >
                                                        ❌
                                                    </button>
                                                )}
                                            </div>

                                            <input
                                                type="file"
                                                id="profile_picture"
                                                className="hidden"
                                                onChange={(event) => {
                                                    const file = event.target.files[0];
                                                    if (!file) return;

                                                    setImageFile(file);
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        profile_picture: URL.createObjectURL(file),
                                                    }));
                                                }}

                                            />
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <Label htmlFor="bio" className="text-white">Bio</Label>
                                            <Textarea id="bio" name="bio" placeholder="Tell us about yourself..." value={formData.bio} onChange={handleChange} className="bg-gray-900 border-red-500 text-white" />
                                        </div>

                                        {/* Age & Gender */}
                                        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                                            <div>
                                                <Label htmlFor="age" className="text-white">Age</Label>
                                                <Input type="number" id="age" name="age" placeholder="Enter your age" value={formData.age} onChange={handleChange} className="bg-gray-900 border-red-500 text-white" />
                                            </div>

                                            <div>
                                                <Label htmlFor="gender" className="text-white">Gender</Label>
                                                <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))} value={formData.gender} >
                                                    <SelectTrigger className='bg-gray-900 text-white border-red-500'>
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
                                                    <SelectTrigger className='bg-gray-900 text-white border-red-500'>
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
                                                    <SelectTrigger className='bg-gray-900 text-white border-red-500'>
                                                        <SelectValue placeholder="Select country" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(countryNameToCode).map(([country, code]) => (
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
                                                    <SelectTrigger className='bg-gray-900 text-white border-red-500'>
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
                                                    <SelectTrigger className='bg-gray-900 text-white border-red-500'>
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
                                                className='bg-gray-900 text-white border-red-500'
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
                                                className='bg-gray-900 text-white border-red-500'
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
                                                className='bg-gray-900 text-white border-red-500'
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
                                                className='bg-gray-900 text-white border-red-500'
                                            />
                                        </div>


                                        <Button disabled={editIsLoading} type="submit" className="w-full bg-primary hover:bg-primary-hover text-medium text-white font-bold py-2 px-4 rounded flex align-items">
                                            {editIsLoading
                                                ?
                                                <div className='flex justify-center items-center gap-2'>
                                                    <p> Updating </p>
                                                    <ButtonLoader />
                                                </div>
                                                :
                                                <p> Update Profile </p>
                                            }
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )
                }
            </div>
        </>
    );
}