import { useEffect, useState } from "react"
import { toast } from 'react-hot-toast'

import toastConfig from "../configs/toastConfig"
import UserCard from "../components/UserCard"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, } from "@/components/ui/drawer"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import Filters from "@/components/Filters"
import Loading from "@/components/Loading"
import { API } from "@/configs/api"
import { countryNameToCode } from "@/configs/countryNameToCode"


export default function Discover() {
    const [isLoading, setIsLoading] = useState(true);
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

    async function fetchUsers(filterParams) {
        setIsLoading(true)
        
        try {
            const response = await API(`/users/discover?${filterParams}`, 'GET', null);
            const data = response.data

            if (data.status === "success") {
                setUsers(data.allUsers);
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
        fetchUsers("");
    }, []);
    
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

                    <Card className="max-md:hidden w-full md:w-80 h-fit sticky top-20 bg-gray-900 border-transparent">
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
