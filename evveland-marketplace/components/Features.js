import {
  Box,
  VStack,
  Button,
  Flex,
  Divider,
  chakra,
  Grid,
  GridItem,
  Container,
  useColorModeValue,
} from '@chakra-ui/react';
import { } from '@chakra-ui/react';



const Feature = ({ heading, text }) => {
  return (
    <GridItem>
      <chakra.h3 fontSize="xl" fontWeight="600">
        {heading}
      </chakra.h3>
      <chakra.p>{text}</chakra.p>
    </GridItem>
  );
};

export default function Features() {
  return (
    <Box as={Container} maxW="7xl" mt={14} p={4} color={"whiteAlpha.500"}>
      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(2, 1fr)',
        }}
        gap={4}>
        <GridItem colSpan={1}>
          <VStack alignItems="flex-start" spacing="20px">
            <chakra.h2 fontSize="3xl" fontWeight="700">
              Products
            </chakra.h2>
            <Button colorScheme='whiteAlpha' size="md">
              Create NFT
            </Button>
          </VStack>
        </GridItem>
        <GridItem>
          <Flex>
            <chakra.p>
              Meet a vibrant community of artists, creators, and collectors who all shared a passion for unique and one-of-a-kind digital art.
              Discuss the latest trends in digital art, workshops where you could learn new skills and techniques,
              and even live events where you could meet the artists behind your favorite works in person.
            </chakra.p>
          </Flex>
        </GridItem>
      </Grid>
      <Divider mt={12} mb={12} />
      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        }}
        gap={{ base: '8', sm: '12', md: '16' }}
        alignContent={'justificed'}>
        <Feature
          heading={'Art Collections'}
          text={'Blockchain secured digital artworks from the world most popular Artists rare collections'}
        />

        <Feature
          heading={'Event Tickets'}
          text={'Event tickets provide a secure, convenient, and potentially lucrative way for event organizers and attendees to manage and access events.'}
        />
        <Feature
          heading={'Digital Merchandise'}
          text={'Digital art, in-game items, or other virtual collectible'}
        />
        <Feature
          heading={'Virtual Venues'}
          text={
            "For individuals or organizations to host events, meetings, and conferences virtually. Includes webinars, workshops, concerts, trade shows,live video streaming, interactive chat, virtual exhibitor booths, and networking opportunities. Offers virtual reality experiences and the ability to host smaller breakout sessions within the main event."}
        />

      </Grid>
    </Box>
  );
}
