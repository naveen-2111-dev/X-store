import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const IMAGES = [
  "/img1.png",
  "/img2.png",
  "/img3.png",
  "/img4.png",
  "/img5.png",
];

const FolderStack = ({ className = "", images = IMAGES }) => {
  const [stack, setStack] = useState(images);

  useEffect(() => {
    const interval = setInterval(() => {
      setStack((prev) => {
        const newStack = [...prev];
        newStack.unshift(newStack.pop());
        return newStack;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="relative w-full h-full flex items-center justify-center">
        {stack.map((imageUrl, index) => (
          <motion.div
            key={imageUrl}
            className="absolute w-full aspect-[3/4] max-w-[250px] md:max-w-[180px] lg:max-w-[400px] bg-white/10 backdrop-blur-lg border border-lime-400/20 rounded-xl shadow-lg overflow-hidden"
            style={{
              zIndex: 10 - index,
              x: index * 5,
              y: index * 5,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: index === 0 ? 1.05 : 1,
              transition: { 
                duration: 0.6,
                x: { duration: 0.6 },
                y: { duration: 0.6 }
              }
            }}
          >
            <img
              src={imageUrl}
              alt="Collection item"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FolderStack;