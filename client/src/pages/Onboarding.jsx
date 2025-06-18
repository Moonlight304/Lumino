import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { toast } from 'react-hot-toast';
import { CgProfile } from "react-icons/cg";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { avatarURLState, displayNameState } from "../configs/atoms";
import toastConfig from "../configs/toastConfig";
import { countryNameToCode } from "@/configs/countryNameToCode";
import removeOldImage from "../helpers/removeOldImage";
import { API } from "@/configs/api";


export default function Onboarding() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [globalDisplayName] = useRecoilState(displayNameState);
    const [globalAvatarURL, setGlobalAvatarURL] = useRecoilState(avatarURLState);

    const [formData, setFormData] = useState({
        age: "",
        bio: "",
        profile_picture: "",
        country: "",
        gender: "",
        platform: "",
        playstyle: "",
        communication_preference: "",
        favourite_games: "",
        favourite_genres: ""
    });

    const requiredFields = [
        'age',
        'gender',
        'country',
        'communication_preference',
        'platform',
        'playstyle',
    ]

    const mapping = {
        "age": "Age",
        "country": "Country",
        "gender": "Gender",
        "platform": "Platform",
        "playstyle": "Playstyle",
        "communication_preference": "Communication Preference"
    }

    const [imageFile, setImageFile] = useState(null);
    const [oldImageURL, setOldImageURL] = useState("");

    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleOnboarding(e) {
        e.preventDefault();
        setIsSubmitting(true);

        for (const field of requiredFields) {
            if (formData[field] === "") {
                toast.error(`${mapping[field]} can't be empty`, toastConfig);
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const response = await API('/auth/onboarding', 'POST', formData);
            const data = response.data;

            if (data.status === "success") {
                setGlobalAvatarURL(formData.profile_picture);
                toast.success("Welcome to Lumino", toastConfig);
                navigate("/discover");
            }
            else {
                toast.error(data.message, toastConfig);
            }
        }
        catch (e) {
            console.log(e.message);
            toast.error("Oops.. an error occurred", toastConfig);
        }
        finally {
            setIsSubmitting(false);
        }
    }

    async function handleProfilePicChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Remove previous image from Cloudinary if exists
        if (formData.profile_picture) {
            await removeOldImage(formData.profile_picture);
        }

        setImageFile(file);

        // Upload new image to Cloudinary
        const form = new FormData();
        form.append("imageFile", file);
        const imageURLResponse = await API('/images/upload?folder=avatars', 'POST', form);
        const uploadedURL = imageURLResponse.data.secure_url;

        setFormData((prev) => ({ ...prev, profile_picture: uploadedURL }));
        setOldImageURL(uploadedURL);
    }

    async function handleRemoveProfilePic() {
        if (formData.profile_picture) {
            await removeOldImage(formData.profile_picture);
        }
        setFormData((prev) => ({ ...prev, profile_picture: "" }));
        setImageFile(null);
        setOldImageURL("");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <Card className="w-full max-w-2xl bg-gray-900 shadow-lg border border-red-500">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl text-red-500">Welcome to Lumino</CardTitle>
                    <p className="text-lg text-gray-400">Let&apos;s set up your profile, {globalDisplayName}</p>
                </CardHeader>
                <CardContent className={'max-md:px-2'}>
                    <form onSubmit={handleOnboarding} className="space-y-6">
                        {/* Profile Picture */}
                        <div className="flex flex-col items-center space-y-4">
                            <Label htmlFor="profile_picture" className="text-red-400">Profile Picture</Label>
                            <div className="relative w-36 h-36 rounded-full border-4 border-red-500 flex items-center justify-center">
                                {formData.profile_picture ? (
                                    <>
                                        <img src={formData.profile_picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={handleRemoveProfilePic}
                                            className="absolute bottom-1 border-2 border-white rounded-full bg-black"
                                        >
                                            ❌
                                        </button>
                                    </>
                                ) : (
                                    <label htmlFor="profile_picture" className="w-32 h-32 rounded-full border-4 border-red-500 flex items-center justify-center cursor-pointer">
                                        <CgProfile className="w-20 h-20 text-red-500" />
                                    </label>
                                )}
                            </div>
                            <input
                                type="file"
                                id="profile_picture"
                                className="hidden"
                                onChange={handleProfilePicChange}
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
                                <Label htmlFor="country" className="text-white">Country</Label>
                                <Select value={formData.country} onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))} >
                                    <SelectTrigger className='bg-gray-800 text-white border-red-500'>
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(countryNameToCode).map((country) => (
                                            <SelectItem key={countryNameToCode[country]} value={country}>
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

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


                        <Button type="submit" className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up your profile...
                                </>
                            ) : (
                                "Complete Setup"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
