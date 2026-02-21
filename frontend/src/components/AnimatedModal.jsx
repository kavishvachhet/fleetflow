import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const AnimatedModal = ({ isOpen, onClose, title, children, type = 'confirm' }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden glass-panel border border-white/50"
                    >
                        {/* Header */}
                        <div className={`px-6 py-4 border-b border-slate-100 flex justify-between items-center ${type === 'danger' ? 'bg-red-50/50' : 'bg-blue-50/50'}`}>
                            <h3 className={`font-bold text-lg ${type === 'danger' ? 'text-red-700' : 'text-slate-900'}`}>{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200/50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AnimatedModal;
