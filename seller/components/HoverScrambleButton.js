import { motion } from 'framer-motion'
import DecryptedText from '@/components/DecryptedText'

const HoverScrambleButton = ({ 
  text = "Explore Marketplace",
  className = "",
  speed = 40,
  ...props 
}) => {
  return (
    <motion.button
      className={`px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-colors relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <DecryptedText
        text={text}
        animateOn="hover"
        speed={speed}
        sequential={true}
        revealDirection="center"
        className="font-semibold"
        encryptedClassName="text-blue-200"
        useOriginalCharsOnly={true}
      />
    </motion.button>
  )
}

export default HoverScrambleButton