import React, { useEffect, useState } from 'react';
import { FaUserFriends, FaSearch, FaComments, FaGamepad } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userIDState } from '../configs/atoms';

export default function Landing() {
    const [globalUserID] = useRecoilState(userIDState);

    const navigate = useNavigate();
    useEffect(() => {
        if (globalUserID) {
            navigate('/');
        }
    }, []);

    return (
        <div>
            {/* Header */}
            <header className="container mx-auto px-10 py-6 flex justify-between items-center">
                <div className="text-2xl font-bold text-primary">Lumino</div>
                <nav className="hidden md:block">
                    <ul className="flex space-x-6">
                        <Link to={'/'} className="p-2 rounded-lg hover:bg-primary transition duration-300"> Home </Link>
                        <Link to={'/feed'} className="p-2 rounded-lg hover:bg-primary transition duration-300"> Community </Link>
                    </ul>
                </nav>
                <button className="md:hidden text-2xl">☰</button>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Connect. Play. Conquer.</h1>
                <p className="text-xl mb-8">Join Lumino, the ultimate social gaming platform for passionate gamers.</p>

                <Link to={'/auth'}>
                    <button className=" text-white border-2 px-8 py-3 rounded-lg text-lg font-semibold shadow-white shadow-lg hover:shadow-xl bg-opacity-80 transition duration-300">
                        Get Started
                    </button>
                </Link>
            </section>

            {/* Features Section */}
            <section className="bg-gray-900 py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose Lumino?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<FaUserFriends className="text-4xl mb-4 text-primary" />}
                            title="Gamer Profiles"
                            description="Create your unique gamer identity and connect with like-minded players."
                        />
                        <FeatureCard
                            icon={<FaSearch className="text-4xl mb-4 text-primary" />}
                            title="LFG Groups"
                            description="Find the perfect team for your next gaming session with ease."
                        />
                        <FeatureCard
                            icon={<FaComments className="text-4xl mb-4 text-primary" />}
                            title="Community Discussions"
                            description="Engage in vibrant discussions about your favorite games and strategies."
                        />
                        <FeatureCard
                            icon={<FaGamepad className="text-4xl mb-4 text-primary" />}
                            title="Advanced Matchmaking"
                            description="Get matched with players that suit your skill level and gaming preferences."
                        />
                    </div>
                </div>
            </section>

            {/* Community Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-4xl font-bold mb-6">Join Our Thriving Community</h2>
                <p className="text-xl mb-8">Connect with millions of gamers worldwide and elevate your gaming experience.</p>
                <div className="flex justify-center space-x-4">
                    <div className="w-16 h-16 bg-primary rounded-full"></div>
                    <div className="w-16 h-16 bg-primary rounded-full"></div>
                    <div className="w-16 h-16 bg-primary rounded-full"></div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-primary py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Level Up Your Gaming Experience?</h2>
                    <p className="text-xl mb-8">Join thousands of gamers on Lumino and take your gaming to the next level.</p>

                    <button className="bg-background text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-opacity-80 transition duration-300">
                        <Link to={'/auth'}> Sign Up Now </Link>
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-8">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; {new Date().getFullYear()} Lumino. All rights reserved.</p>
                    <div className="mt-4">
                        <a href="#" className="text-gray-400 hover:text-primary mx-2 transition duration-300">Terms of Service</a>
                        <a href="#" className="text-gray-400 hover:text-primary mx-2 transition duration-300">Privacy Policy</a>
                        <a href="#" className="text-gray-400 hover:text-primary mx-2 transition duration-300">Contact Us</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg text-center">
            {icon}
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-300">{description}</p>
        </div>
    );
};
