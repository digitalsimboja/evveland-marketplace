import { Box, useColorModeValue } from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Marketplace from "../components/Marketplace";

export default function Home() {
  return (
    <>
      <Box width={"100vw"} bg={useColorModeValue("gray.800", "gray: 800")}>
        {/* Add the Navbar */}
        <Navbar bg={useColorModeValue("white", "gray.800")} />
        <Hero />
        <Marketplace  />
        <Features />
        <Footer />

      </Box>

    </>
  )
}
