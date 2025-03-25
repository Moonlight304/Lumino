import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useRecoilState } from "recoil"
import axios from "axios"
import { toast } from 'react-hot-toast'

import { userIDState } from "../configs/atoms"
import toastConfig from "../configs/toastConfig"
import UserCard from "../components/UserCard"
import Navbar from "../components/Navbar"

import { Button } from "@/components/ui/button"
import { DualRangeSlider } from '@/components/ui/dual-range-slider';
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, } from "@/components/ui/drawer"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label";
import { Filter, Loader2, Minus, Plus, Users } from "lucide-react"
import { countryCodes } from '../configs/countryCodes';
import Filters from "@/components/Filters"
import Loading from "@/components/Loading"


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
            navigate("/");
            toast.error('Cannot access page', toastConfig);
        }
        fetchUsers("")
    }, [globalUserID, navigate])

    return (
        <div className="min-h-fit bg-background text-white">
            <main className="w-full px-4 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    <Drawer className="text-white">
                        <DrawerTrigger asChild className="md:hidden">
                            <Button variant="outline" className="text-lg"> Filters </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <div className="px-4 overflow-y-auto">
                                <Filters
                                    filters={filters}
                                    setFilters={setFilters}
                                    ageLimit={ageLimit}
                                    setAgeLimit={setAgeLimit}
                                    fetchUsers={fetchUsers}
                                />
                            </div>
                        </DrawerContent>
                    </Drawer>

                    <Card className="max-md:hidden w-full md:w-80 h-fit sticky top-20 bg-gray-900 border-red-600">
                        <CardContent className="p-6">
                            <Filters
                                filters={filters}
                                setFilters={setFilters}
                                ageLimit={ageLimit}
                                setAgeLimit={setAgeLimit}
                                fetchUsers={fetchUsers}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-red-500">
                            <Users className="h-6 w-6" />
                            Discover Gamers
                        </h1>
                        {isLoading ? (
                            <Loading message={'Finding players for you...'} />
                        ) : users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-96 text-center">
                                <Users className="h-16 w-16 text-red-500 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No players found</h3>
                                <p className="text-red-400 max-w-md">
                                    Try adjusting your filters to find more gaming buddies.
                                </p>
                            </div>
                        ) : (
                            <div className='grid gap-5 grid-cols-4 max-2xl:grid-cols-3 max-xl:gap-2 max-lg:grid-cols-2 max-md:grid-cols-1 w-full overflow-clip'>
                                {users.map((user) => (
                                    <UserCard key={user._id} user={user} users={users} setUsers={setUsers} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
