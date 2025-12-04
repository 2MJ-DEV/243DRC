"use client"

import { motion, useScroll } from "motion/react"

export default function ScrollLinked() {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      id="scroll-indicator"
      className="top-0 z-50"
      style={{
        scaleX: scrollYProgress,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "5px",
        transformOrigin: "0 0",
        backgroundColor: "#007FFF",
      }}
    />
  )
}