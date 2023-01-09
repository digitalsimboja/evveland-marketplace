import { Box, useColorModeValue } from "@chakra-ui/react";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
    <Box width={"100vw"} bg={useColorModeValue("gray.800", "gray: 800")}>
      {/* Add the Navbar */}
      <Navbar bg={useColorModeValue("white", "gray.800")} />

    </Box>
    
    </>
  )
}
