import { motion } from 'framer-motion';

const LicensePlateInput = ({ value, onChange }) => {
    // Format input to uppercase and add a dash if needed (e.g., ABC-1234)
    const handleChange = (e) => {
        let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        if (val.length === 3 && value.length < 3 && !val.includes('-')) {
            val = val + '-';
        }
        if (val.length <= 8) { // max format like XXX-XXXX
            onChange(val);
        }
    };

    return (
        <div className="relative group perspective-1000">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                License Plate Number
            </label>
            <div className="relative">
                {/* The "Physical" License Plate Background */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-yellow-100 to-yellow-300 border-4 border-slate-800 rounded-lg shadow-inner flex items-center justify-between px-2 overflow-hidden pointer-events-none z-10"
                    whileHover={{ rotateX: 5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <div className="h-2 w-2 rounded-full bg-slate-800 shadow-sm opacity-80" />
                    {/* Simulated reflective sheen */}
                    <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>

                    <div className="h-2 w-2 rounded-full bg-slate-800 shadow-sm opacity-80" />
                </motion.div>

                {/* The actual input field perfectly aligned over the background */}
                <input
                    type="text"
                    required
                    value={value}
                    onChange={handleChange}
                    className="w-full relative z-20 bg-transparent text-center font-bold text-3xl tracking-[0.2em] text-slate-800 py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50 caret-indigo-600 font-mono"
                    placeholder="XYZ-1234"
                    style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.7), -1px -1px 0px rgba(0,0,0,0.2)' }}
                />

                {/* Bottom screws */}
                <div className="absolute bottom-2 left-3 h-2 w-2 rounded-full bg-slate-800 shadow-sm opacity-80 z-10 pointer-events-none" />
                <div className="absolute bottom-2 right-3 h-2 w-2 rounded-full bg-slate-800 shadow-sm opacity-80 z-10 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-400 mt-2 italic">Format: XXX-XXXX. The plate updates physically as you type.</p>
        </div>
    );
};

export default LicensePlateInput;
