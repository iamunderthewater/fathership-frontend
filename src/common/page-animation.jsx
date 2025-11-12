import { AnimatePresence, motion } from "framer-motion";

const AnimationWrapper = ({ children, keyValue, initial = { opacity: 0 }, animate = { opacity: 1 }, transition = { duration: 1 }, className }) => {
    return (
        <AnimatePresence>
            <motion.div
                key={keyValue}
                // initial={initial}
                // animate={animate}
                // transition={transition}
                className={className} 
                //commented to remove animation from all places since it is not as appealing as expected on pagination data
            >
                { children }
            </motion.div>
        </AnimatePresence>
    )
}

export default AnimationWrapper;