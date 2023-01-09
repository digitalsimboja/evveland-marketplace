
import {
    Box,
    Container,
    Image,
    Link,
    SimpleGrid,
    Stack,
    Text,
    useColorModeValue,
  } from '@chakra-ui/react';
  
  const Logo = () => {
    return (
      <Image alt="logo" src='' />
    );
  };
  
  const ListHeader = ({ children }) => {
    return (
      <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
        {children}
      </Text>
    );
  };
  
  export default function Footer() {
    return (
      <Box
        // bg={useColorModeValue('gray.50', 'gray.900')}
        color={useColorModeValue('gray.100', 'gray.200')}>
        <Container as={Stack} maxW={'6xl'} py={10}>
          <SimpleGrid
            templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr 1fr' }}
            spacing={8}>
            <Stack spacing={6}>
              <Box>
                <Logo color={useColorModeValue('gray.700', 'white')} />
              </Box>
              <Text fontSize={'sm'}>
                © Evveland. All rights reserved
              </Text>
            </Stack>
            <Stack align={'flex-start'}>
              <ListHeader>Product</ListHeader>
              <Link href={'#'}>Dahsboard</Link>
              <Link href={'#'}>Featured Products</Link>
              <Link href={'#'}>Delivery Services</Link>
              <Link href={'#'}>Events</Link>
              
            </Stack>
            <Stack align={'flex-start'}>
              <ListHeader>Company</ListHeader>
              <Link href={'#'}>About</Link>
              <Link href={'#'}>Marketplace</Link>
              <Link href={'#'}>Virtual Venues</Link>
              <Link href={'#'}>We are Hiring</Link>
              
             
            </Stack>
            <Stack align={'flex-start'}>
              <ListHeader>Support</ListHeader>
              <Link href={'#'}>Help Center</Link>
              <Link href={'#'}>Terms of Service</Link>
              <Link href={'#'}>Legal</Link>
              <Link href={'#'}>Privacy Policy</Link>
  
            </Stack>
            <Stack align={'flex-start'}>
              <ListHeader>Follow Us</ListHeader>
              <Link href={'#'}>Facebook</Link>
              <Link href={'#'}>Twitter</Link>
              <Link href={'#'}>Instagram</Link>
              <Link href={'#'}>LinkedIn</Link>
            </Stack>
          </SimpleGrid>
        </Container>
      </Box>
    );
  }