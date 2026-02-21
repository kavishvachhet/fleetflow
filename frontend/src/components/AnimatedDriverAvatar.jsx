import { motion } from 'framer-motion';

const AnimatedDriverAvatar = ({ name, status, className = "" }) => {
    // Generate a consistent hue based on name so each driver has a "unique" shirt color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 60%)`;

    // Animation variants based on status
    const isDriving = status === 'On Trip';
    const isResting = status === 'Off Duty';
    const isAvailable = status === 'On Duty';

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <motion.div
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm"
                animate={{
                    y: isDriving ? [0, -2, 0] : isResting ? [0, 1, 0] : 0,
                    scale: isAvailable ? [1, 1.05, 1] : 1
                }}
                transition={{
                    duration: isDriving ? 0.4 : isResting ? 2 : 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full pt-2">
                    {/* Shoulders/Shirt */}
                    <path d="M 20 100 Q 50 60 80 100 Z" fill={color} />
                    {/* Head */}
                    <motion.circle
                        cx="50"
                        cy="45"
                        r="22"
                        fill="#fcd5ce"
                        animate={{
                            rotate: isDriving ? [-2, 2, -2] : 0,
                            y: isResting ? [0, 2, 0] : 0
                        }}
                        transition={{
                            duration: isDriving ? 0.6 : 3,
                            repeat: Infinity
                        }}
                    />
                    {/* Eyes */}
                    {isResting ? (
                        <g>
                            <path d="M 40 45 Q 43 47 46 45" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <path d="M 54 45 Q 57 47 60 45" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </g>
                    ) : (
                        <g>
                            <circle cx="43" cy="43" r="3" fill="#1e293b" />
                            <circle cx="57" cy="43" r="3" fill="#1e293b" />
                        </g>
                    )}
                    {/* Cap for logic */}
                    {isDriving && (
                        <path d="M 25 35 Q 50 15 75 35 Z" fill="#334155" />
                    )}
                </svg>
            </motion.div>

            {/* Status indicator pip */}
            <motion.div
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isDriving ? 'bg-blue-500' : isResting ? 'bg-gray-400' : 'bg-green-500'
                    }`}
                animate={isAvailable ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </div>
    );
};

export default AnimatedDriverAvatar;
