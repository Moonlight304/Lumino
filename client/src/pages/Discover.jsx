import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { toast } from 'react-toastify';

import toastConfig from '../configs/toastConfig';
import { userIDState } from '../configs/atoms';

import UserCard from '../components/UserCard';
import Navbar from '../components/Navbar';

const server_url = import.meta.env.VITE_server_url;

export default function Discover() {
    const [isLoading, setIsLoading] = useState(true);
    const [globalUserID] = useRecoilState(userIDState);
    const [users, setUsers] = useState([]);
    const [filters, setFilters] = useState({
        country: '',
        age: '',
        gender: '',
        favourite_games: '',
        favourite_genres: '',
        platform: '',
        playstyle: '',
        communication_preference: '',
    });

    async function handleFilterChange(e) {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const applyFilters = () => {
        const filterParams = new URLSearchParams(filters).toString();
        fetchUsers(filterParams);
    };

    async function fetchUsers(filterParams) {
        try {
            const response = await axios.get(`${server_url}/users/discover?${filterParams}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`,
                },
            });
            const data = response.data;
            console.log(data.allUsers);

            if (data.status === 'success') {
                setUsers(data.allUsers);
            }
            else {
                toast.error(data.message, toastConfig);
            }
        }
        catch (e) {
            console.log(e.message);
            toast.error('Oops.. an error occurred', toastConfig);
        }
        finally {
            setIsLoading(false);
        }
    };

    const navigate = useNavigate();
    useEffect(() => {
        if (!globalUserID) {
            navigate(-1);
        }

        fetchUsers('');
    }, []);

    return (
        <>
            <Navbar />

            <div className='flex'>
                <div className='flex flex-col'>
                    <p className='text-3xl'>Filters</p>
                    <input
                        type='text'
                        name='country'
                        value={filters.country}
                        onChange={handleFilterChange}
                        placeholder='Country'
                        className='m-2'
                    />
                    <input
                        type='text'
                        name='age'
                        value={filters.age}
                        onChange={handleFilterChange}
                        placeholder='Age'
                        className='m-2'
                    />
                    <input
                        type='text'
                        name='gender'
                        value={filters.gender}
                        onChange={handleFilterChange}
                        placeholder='Gender'
                        className='m-2'
                    />
                    <input
                        type='text'
                        name='favourite_games'
                        value={filters.favourite_games}
                        onChange={handleFilterChange}
                        placeholder='Favourite Games (comma separated)'
                        className='m-2'
                    />
                    <input
                        type='text'
                        name='favourite_genres'
                        value={filters.favourite_genres}
                        onChange={handleFilterChange}
                        placeholder='Favourite Genres (comma separated)'
                        className='m-2'
                    />
                    <input
                        type='text'
                        name='platform'
                        value={filters.platform}
                        onChange={handleFilterChange}
                        placeholder='Platform'
                        className='m-2'
                    />
                    <input
                        type='text'
                        name='playstyle'
                        value={filters.playstyle}
                        onChange={handleFilterChange}
                        placeholder='Playstyle'
                        className='m-2'
                    />
                    <input
                        type='text'
                        name='communication_preference'
                        value={filters.communication_preference}
                        onChange={handleFilterChange}
                        placeholder='Communication Preference'
                        className='m-2'
                    />
                    <button
                        onClick={applyFilters}
                        className='m-2 bg-blue-500 text-white p-2'
                    >
                        Apply Filters
                    </button>
                </div>

                {
                    isLoading
                        ? <h1> Loading... </h1>
                        :
                        <div className='flex flex-wrap w-full gap-5 overflow-clip border-2 border-white'>
                            {users.map((user) => (
                                <UserCard key={user._id} user={user} />
                            ))}
                        </div>
                }
            </div>
        </>
    );
}
