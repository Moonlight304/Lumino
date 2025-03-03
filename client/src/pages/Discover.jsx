import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useRecoilState } from "recoil"
import axios from "axios"
import { toast } from "react-toastify"

import { userIDState } from "../configs/atoms"
import toastConfig from "../configs/toastConfig"
import UserCard from "../components/UserCard"
import Navbar from "../components/Navbar"

import { Button } from "@/components/ui/button"
import { DualRangeSlider } from '@/components/ui/dual-range-slider';
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label";
import { Filter, Loader2, Users } from "lucide-react"
import { countryCodes } from '../configs/countryCodes';


const server_url = import.meta.env.VITE_server_url

export default function Discover() {
    const [isLoading, setIsLoading] = useState(true);
    const [globalUserID] = useRecoilState(userIDState);
    const [users, setUsers] = useState([])
    const [ageLimit, setAgeLimit] = useState([0, 100]);
    const [filters, setFilters] = useState({
        country: "",
        ageLower: "",
        ageUpper: "",
        gender: "",
        favourite_games: "",
        favourite_genres: "",
        platform: "",
        playstyle: "",
        communication_preference: "",
    })

    const navigate = useNavigate()

    async function handleFilterChange(e) {
        const { name, value } = e.target
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }))
    }

    const handleSelectChange = (name, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }))
    }

    const applyFilters = () => {
        const filterParams = new URLSearchParams(filters).toString()
        fetchUsers(filterParams)
    }

    async function fetchUsers(filterParams) {
        setIsLoading(true)
        try {
            const response = await axios.get(`${server_url}/users/discover?${filterParams}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwt_token")}`,
                },
            })
            const data = response.data

            if (data.status === "success") {
                setUsers(data.allUsers)
            } 
            else {
                toast.error(data.message, toastConfig)
            }
        } 
        catch (e) {
            toast.error("Oops.. an error occurred", toastConfig)
        } 
        finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!globalUserID) {
            navigate("/")
        }
        fetchUsers("")
    }, [globalUserID, navigate])

    return (
        <div className="min-h-screen bg-background text-white">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    <Card className="w-full md:w-80 h-fit sticky top-20 bg-gray-900 border-red-600">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold flex items-center gap-2 text-red-500">
                                    <Filter className="h-5 w-5" />
                                    Filters
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                    onClick={() => {
                                        setFilters({
                                            country: "",
                                            ageLower: "",
                                            ageUpper: "",
                                            gender: "",
                                            favourite_games: "",
                                            favourite_genres: "",
                                            platform: "",
                                            playstyle: "",
                                            communication_preference: "",
                                        })
                                        setAgeLimit([0, 100])
                                        fetchUsers("")
                                    }}
                                >
                                    Reset
                                </Button>
                            </div>
                            <Separator className="my-4 bg-red-500" />

                            <div className="space-y-4">

                                <div>
                                    <Label htmlFor="age_range" className="text-white"> Age </Label>

                                    <DualRangeSlider
                                        id="age_range"
                                        className="text-white mt-8"
                                        label={(value) => value}
                                        value={ageLimit}
                                        onValueChange={(value) => {
                                            setAgeLimit(value);
                                            handleSelectChange('ageLower', value[0]);
                                            handleSelectChange('ageUpper', value[1]);
                                        }}
                                        min={0}
                                        max={100}
                                        step={1}
                                    />
                                </div>

                                <Select value={filters.country} onValueChange={(value) => handleSelectChange("country", value)} >
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

                                {/* <Input id="country" name="country" value={filters.country} onChange={handleFilterChange} placeholder="Enter country" className="bg-gray-800 text-white border-red-500" /> */}

                                {/* <button onClick={() => console.log(ageLimit)}> CLICK ME </button> <br />
                                <button onClick={() => console.log(filters)}> CLICK ME </button> */}
                                {/* <Input id="age" name="age" value={filters.age} onChange={handleFilterChange} placeholder="Enter age" className="bg-gray-800 text-white border-red-500" /> */}


                                <Select value={filters.gender} onValueChange={(value) => handleSelectChange("gender", value)} >
                                    <SelectTrigger className='bg-gray-800 text-white border-red-500'>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Any">Any</SelectItem>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Input
                                    id="favourite_games"
                                    name="favourite_games"
                                    value={filters.favourite_games}
                                    onChange={handleFilterChange}
                                    placeholder="Comma separated games"
                                    className='bg-gray-800 text-white border-red-500'
                                />

                                <Input
                                    id="favourite_genres"
                                    name="favourite_genres"
                                    value={filters.favourite_genres}
                                    onChange={handleFilterChange}
                                    placeholder="Comma separated genres"
                                    className='bg-gray-800 text-white border-red-500'
                                />

                                <Select value={filters.platform} onValueChange={(value) => handleSelectChange("platform", value)}>
                                    <SelectTrigger className='bg-gray-800 text-white border-red-500'>
                                        <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Any">Any</SelectItem>
                                        <SelectItem value="PC">PC</SelectItem>
                                        <SelectItem value="PlayStation">PlayStation</SelectItem>
                                        <SelectItem value="Xbox">Xbox</SelectItem>
                                        <SelectItem value="Android">className="text-white"</SelectItem>
                                        <SelectItem value="IOS">IOS</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filters.playstyle} onValueChange={(value) => handleSelectChange("playstyle", value)}>
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

                                <Select
                                    value={filters.communication_preference}
                                    onValueChange={(value) => handleSelectChange("communication_preference", value)}
                                >
                                    <SelectTrigger className='bg-gray-800 text-white border-red-500'>
                                        <SelectValue placeholder="Communication preference" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Any">Any</SelectItem>
                                        <SelectItem value="Voice">Voice Chat</SelectItem>
                                        <SelectItem value="Text">Text Chat</SelectItem>
                                        <SelectItem value="Both">Both</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    onClick={applyFilters}
                                    className="w-full mt-6 bg-red-600 hover:bg-red-700"
                                >Apply Filters</Button>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-red-500">
                            <Users className="h-6 w-6" />
                            Discover Gamers
                        </h1>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-96">
                                <Loader2 className="h-12 w-12 animate-spin text-red-500 mb-4" />
                                <p className="text-lg text-red-400">Finding players for you...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-96 text-center">
                                <Users className="h-16 w-16 text-red-500 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No players found</h3>
                                <p className="text-red-400 max-w-md">
                                    Try adjusting your filters to find more gaming buddies.
                                </p>
                            </div>
                        ) : (
                            <div className='flex flex-wrap w-full gap-5 overflow-clip'>
                                {users.map((user) => (
                                    <UserCard key={user._id} user={user} className="border-red-500 bg-gray-900" />
                                ))}
                            </div>
                            // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            //     {users.map((user) => (
                            //         <UserCard key={user._id} user={user} className="border-red-500 bg-gray-900" />
                            //     ))}
                            // </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
