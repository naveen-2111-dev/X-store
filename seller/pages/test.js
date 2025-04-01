import { motion } from 'framer-motion'
import DecryptedText from '@/components/DecryptedText'
import "@/app/globals.css"

const HoverButton = () => {
  return (
    <motion.button
      className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-colors relative overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <DecryptedText
        text="Explore Marketplace"
        animateOn="hover"
        speed={40}
        sequential={true}
        revealDirection="center"
        className="font-semibold"
        encryptedClassName="text-blue-200"
        useOriginalCharsOnly={true}
      />
    </motion.button>
  )
}

export default HoverButton