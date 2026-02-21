import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

// A single rolling digit column
const DigitColumn = ({ digit }) => {
    return (
        <div className="relative w-6 h-8 sm:w-8 sm:h-12 bg-slate-900 border-x border-slate-700/50 overflow-hidden flex justify-center shadow-inner digits-container">
            {/* Glossy overlay for physical drum look */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-10" />
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={digit}
                    initial={{ y: "-100%", opacity: 0.5, rotateX: 45 }}
                    animate={{ y: "0%", opacity: 1, rotateX: 0 }}
                    exit={{ y: "100%", opacity: 0.5, rotateX: -45 }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    className="absolute inset-0 flex items-center justify-center text-white font-mono font-bold text-xl sm:text-2xl tracking-tighter"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {digit}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// The main odometer component
const AnimatedOdometer = ({ value, label = "KM", padCount = 6 }) => {
    const [digits, setDigits] = useState([]);

    useEffect(() => {
        // Pad the value with leading zeros up to padCount digits for realism
        const valStr = value.toString().padStart(padCount, '0');
        setDigits(valStr.split(''));
    }, [value, padCount]);

    return (
        <div className="flex items-center space-x-3">
            <div className="flex bg-slate-800 p-1 rounded-md border border-slate-600 shadow-lg justify-end w-fit">
                {digits.map((digit, i) => (
                    <DigitColumn key={`${i}-${digit}`} digit={digit} />
                ))}
            </div>
            {label && <span className="text-slate-500 font-bold text-sm tracking-widest">{label}</span>}
        </div>
    );
};

export default AnimatedOdometer;
