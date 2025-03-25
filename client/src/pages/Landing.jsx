import React, { useEffect, useState } from 'react';
import {
    FaRocket,
    FaTrophy,
    FaUsers,
    FaHeadset,
    FaBolt,
    FaCode,
    FaGamepad,
    FaFireAlt
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userIDState } from '../configs/atoms';
import { motion, AnimatePresence } from 'framer-motion';
import toastConfig from '@/configs/toastConfig';
import toast from 'react-hot-toast';

// Memoized Background Component to reduce re-renders
const GamingBackground = React.memo(() => {
    const GameParticles = React.useMemo(() => {
        return () => {
            const particles = [...Array(100)].map((_, i) => {
                const particleType = Math.random();
                return (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            opacity: 0,
                            scale: particleType > 0.7 ? 1.5 : 1
                        }}
                        animate={{
                            x: [
                                Math.random() * window.innerWidth,
                                Math.random() * window.innerWidth,
                                Math.random() * window.innerWidth
                            ],
                            y: [
                                Math.random() * window.innerHeight,
                                Math.random() * window.innerHeight,
                                Math.random() * window.innerHeight
                            ],
                            opacity: [0, particleType > 0.5 ? 0.4 : 0.2, 0],
                        }}
                        transition={{
                            duration: Math.random() * 8 + 5,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut"
                        }}
                        className={`absolute ${particleType > 0.8
                            ? 'bg-red-600/30 w-4 h-4'
                            : particleType > 0.5
                                ? 'bg-purple-600/20 w-3 h-3'
                                : 'bg-blue-600/10 w-2 h-2'
                            } blur-sm`}
                    />
                );
            });
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {particles}
                </div>
            );
        };
    }, []);

    const HolographicGrid = React.useMemo(() => {
        return () => (
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ff00ff" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#00ffff" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#ff0000" stopOpacity="0.05" />
                        </linearGradient>
                        <pattern id="holographic-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="url(#neon-gradient)"
                                strokeWidth="0.5"
                                strokeOpacity="0.3"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#holographic-grid)" />
                </svg>
            </div>
        );
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
            <GameParticles />
            <HolographicGrid />
        </div>
    );
});

// Optimized Landing Page Component
export default function Landing() {
    const [globalUserID] = useRecoilState(userIDState);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        if (globalUserID) {
            navigate('/discover');
            toast.error('Cannot access page', toastConfig);
        }

        // Responsive check
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [globalUserID, navigate]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 10,
                stiffness: 120
            }
        }
    };

    return (
        <div className="min-h-screen text-white relative overflow-hidden">
            <GamingBackground />

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto px-4 py-4 flex justify-between items-center relative z-10"
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-3xl md:text-5xl font-black text-red-500"
                >
                    LUMINO
                </motion.div>
                <nav className={`${isMobile ? 'hidden' : 'flex'} space-x-4 md:space-x-6 items-center`}>
                    <NavItem to={'/'}>Home</NavItem>
                    <NavItem to={'/feed'}>Community</NavItem>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Link to={'/auth'}>
                            <button className="px-4 md:px-8 py-2 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition transform shadow-lg text-sm md:text-base">
                                Join the Battle
                            </button>
                        </Link>
                    </motion.div>
                </nav>
            </motion.header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-12 md:py-16 grid md:grid-cols-2 gap-8 md:gap-10 items-center relative z-10">
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-4 md:space-y-6 text-center md:text-left"
                >
                    <h1 className="text-4xl md:text-7xl font-black text-red-500 animate-pulse leading-tight">
                        Unleash Your Gaming Potential
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-300 opacity-80 tracking-wide">
                        More than a platform. A digital battleground where legends are forged, skills are sharpened, and gaming dreams become epic reality.
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex justify-center md:justify-start"
                    >
                        <Link to={'/auth'}>
                            <button className="px-8 md:px-12 py-3 md:py-5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition transform shadow-2xl flex items-center gap-3">
                                <FaGamepad className='w-10 h-10' /> Start Your Epic Journey
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Animated Features Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 gap-4 md:gap-6"
                >
                    <AnimatePresence>
                        <FeatureCard
                            variants={itemVariants}
                            icon={<FaRocket className="text-red-500" />}
                            title="Epic Battles"
                            description="Crush opponents in high-stakes multiplayer arenas"
                        />
                        <FeatureCard
                            variants={itemVariants}
                            icon={<FaTrophy className="text-purple-500" />}
                            title="Global Rankings"
                            description="Dominate leaderboards worldwide"
                        />
                        <FeatureCard
                            variants={itemVariants}
                            icon={<FaUsers className="text-blue-500" />}
                            title="Community Hub"
                            description="Connect with gamers globally"
                        />
                        <FeatureCard
                            variants={itemVariants}
                            icon={<FaHeadset className="text-green-500" />}
                            title="Team Sync"
                            description="Find perfect gaming allies"
                        />
                    </AnimatePresence>
                </motion.div>
            </section>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="bg-black/50 py-6 md:py-8 mt-8 md:mt-16 relative z-10"
            >
                <div className="container mx-auto px-4 text-center">
                    <div className="flex justify-center space-x-4 md:space-x-6 mb-4 md:mb-6">
                        <FooterIcon icon={<FaBolt className="text-red-500" />} />
                        <FooterIcon icon={<FaCode className="text-purple-500" />} />
                        <FooterIcon icon={<FaFireAlt className="text-green-500" />} />
                    </div>
                    <p className="text-sm md:text-base text-gray-400 tracking-wide">
                        &copy; {new Date().getFullYear()} Lumino - Where Legends Clash
                    </p>
                </div>
            </motion.footer>
        </div>
    );
}

// Memoized components to prevent unnecessary re-renders
const NavItem = React.memo(({ to, children }) => (
    <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
    >
        <Link to={to} className="p-2 text-white hover:text-red-500 transition duration-300 text-sm md:text-base">
            {children}
        </Link>
    </motion.div>
));

const FeatureCard = React.memo(React.forwardRef(({ icon, title, description, ...props }, ref) => (
    <motion.div
        ref={ref}
        {...props}
        className="bg-black/60 p-4 md:p-6 rounded-2xl border border-red-900/30 hover:border-red-500 transition transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
    >
        <div className="text-3xl md:text-5xl mb-2 md:mb-4">{icon}</div>
        <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 text-white">{title}</h3>
        <p className="text-xs md:text-base text-gray-300">{description}</p>
    </motion.div>
)));

const FooterIcon = React.memo(({ icon }) => (
    <motion.div
        whileHover={{ rotate: 360, scale: 1.2 }}
        className="text-2xl md:text-4xl hover:text-red-500 transition"
    >
        {icon}
    </motion.div>
));