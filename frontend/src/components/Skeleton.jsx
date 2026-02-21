import { motion } from 'framer-motion';

const Skeleton = ({ className = '', style = {} }) => {
    return (
        <motion.div
            className={`bg-slate-200/60 rounded-lg ${className}`}
            style={style}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
    );
};

export default Skeleton;
