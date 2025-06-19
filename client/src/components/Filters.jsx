import { toast } from 'react-hot-toast'
import toastConfig from "../configs/toastConfig"

import { Button } from "@/components/ui/button"
import { DualRangeSlider } from '@/components/ui/dual-range-slider';
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react"
import { countryNameToCode } from "../configs/countryNameToCode";

export default function Filters({ filters, setFilters, ageLimit, setAgeLimit, fetchUsers }) {
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
        fetchUsers(filterParams);
        toast.success('Applied filters', toastConfig);
    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <Filter className="h-5 w-5" />
                    Filters
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white"
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
                    <SelectTrigger className='bg-gray-950 text-white border-transparent'>
                        <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(countryNameToCode).map(([country, code]) => (
                            <SelectItem key={code} value={country}>
                                {country !== 'Don\'t specify' && country}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.gender} onValueChange={(value) => handleSelectChange("gender", value)} >
                    <SelectTrigger className='bg-gray-950 text-white border-transparent'>
                        <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* <SelectItem value="Any">Any</SelectItem> */}
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        {/* <SelectItem value="any">Any</SelectItem> */}
                    </SelectContent>
                </Select>

                <Input
                    id="favourite_games"
                    name="favourite_games"
                    value={filters.favourite_games}
                    onChange={handleFilterChange}
                    placeholder="Comma separated games"
                    className='bg-gray-950 text-white border-transparent'
                />

                <Input
                    id="favourite_genres"
                    name="favourite_genres"
                    value={filters.favourite_genres}
                    onChange={handleFilterChange}
                    placeholder="Comma separated genres"
                    className='bg-gray-950 text-white border-transparent'
                />

                <Select value={filters.platform} onValueChange={(value) => handleSelectChange("platform", value)}>
                    <SelectTrigger className='bg-gray-950 text-white border-transparent'>
                        <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* <SelectItem value="Any">Any</SelectItem> */}
                        <SelectItem value="PC">PC</SelectItem>
                        <SelectItem value="PlayStation">PlayStation</SelectItem>
                        <SelectItem value="Xbox">Xbox</SelectItem>
                        <SelectItem value="Android">Android</SelectItem>
                        <SelectItem value="IOS">IOS</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filters.playstyle} onValueChange={(value) => handleSelectChange("playstyle", value)}>
                    <SelectTrigger className='bg-gray-950 text-white border-transparent'>
                        <SelectValue placeholder="Select playstyle" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* <SelectItem value="Any">Any</SelectItem> */}
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Competitive">Competitive</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.communication_preference}
                    onValueChange={(value) => handleSelectChange("communication_preference", value)}
                >
                    <SelectTrigger className='bg-gray-950 text-white border-transparent'>
                        <SelectValue placeholder="Communication preference" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* <SelectItem value="Any">Any</SelectItem> */}
                        <SelectItem value="Voice">Voice Chat</SelectItem>
                        <SelectItem value="Text">Text Chat</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    onClick={applyFilters}
                    className="w-full mt-6 bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white transition duration-300 ease-in-out"
                >
                    Apply Filters
                </Button>
            </div>
        </>
    );
}