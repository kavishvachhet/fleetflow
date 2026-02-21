import { motion } from 'framer-motion';

const AnimatedVehicleBadge = ({ type, status, className = "" }) => {
    const isDriving = status === 'On Trip';
    const isAvailable = status === 'Available';
    const isInShop = status === 'In Shop';

    // SVG paths for different vehicle types
    const getVehiclePath = () => {
        if (type === 'Heavy Truck') {
            return (
                <path d="M10,60 L10,30 C10,25 15,20 20,20 L60,20 L65,30 L85,30 C90,30 95,35 95,40 L95,60 Z" fill="#3b82f6" />
            );
        } else if (type === 'Truck') {
            return (
                <path d="M15,60 L15,35 C15,30 20,25 25,25 L65,25 L70,35 L90,35 C92,35 95,38 95,42 L95,60 Z" fill="#6366f1" />
            );
        } else { // Van
            return (
                <path d="M20,60 L20,35 C20,28 25,22 35,22 L65,22 C75,22 80,30 85,35 L95,45 L95,60 Z" fill="#8b5cf6" />
            );
        }
    };

    return (
        <div className={`relative flex items-center justify-center w-16 h-12 ${className}`}>
            <motion.div
                className="w-full h-full relative"
                animate={{
                    y: isDriving ? [0, -2, 0] : isAvailable ? [0, 1, 0] : 0,
                    rotate: isInShop ? -5 : 0
                }}
                transition={{
                    duration: isDriving ? 0.3 : isAvailable ? 2 : 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-md">
                    {/* Vehicle Body */}
                    {getVehiclePath()}

                    {/* Windows */}
                    <path d="M68,25 L82,32 L82,33 L68,33 Z" fill="#bae6fd" opacity="0.8" />

                    {/* Headlight */}
                    <circle cx="92" cy="50" r="3" fill="#fef08a" />

                    {/* Wheels */}
                    <motion.circle
                        cx="30" cy="60" r="10" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2"
                        animate={{ rotate: isDriving ? 360 : 0 }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: '30px 60px' }}
                    />
                    <motion.circle
                        cx="75" cy="60" r="10" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2"
                        animate={{ rotate: isDriving ? 360 : 0 }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: '75px 60px' }}
                    />

                    {/* Smoke / Speed Lines if driving */}
                    {isDriving && (
                        <motion.g
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: [0, 1, 0], x: [-10, -30] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        >
                            <line x1="5" y1="50" x2="15" y2="50" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                            <line x1="0" y1="56" x2="10" y2="56" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                        </motion.g>
                    )}

                    {/* Shop spark / zzz if resting/shop */}
                    {isInShop && (
                        <motion.path
                            d="M 50 10 L 45 0 L 55 5 L 45 -5 L 50 -15"
                            stroke="#ef4444" strokeWidth="2" fill="none"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    )}
                </svg>
            </motion.div>
        </div>
    );
};

export default AnimatedVehicleBadge;
