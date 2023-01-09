import { Box, Heading, Container, Text, Stack, useColorModeValue } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Hero() {
  return (
    <>
      <Container maxW={"3xl"}>
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xs", sm: "2xl", md: "3xl" }}
            lineHeight={"110%"}
            color={useColorModeValue('purple.200', 'gray.200')}
          >
            Welcome to Evveland Metaverse Marketplace
            <br />
            <Text as={"span"} color={"pink.500"}>
              Connect your wallet to create and own NFTs on the Marketplace forever
            </Text>
          </Heading>
          <Text color={"gray.500"}>
            Available on the Marketplace includes Virtual Venues, Digital Merchandises, and lots more...
          </Text>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
          >
            <ConnectButton />
          </Stack>
        </Stack>
      </Container>
    </>
  );
}