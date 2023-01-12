import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, AddIcon } from '@chakra-ui/icons';
import { ConnectButton, wallet } from "@rainbow-me/rainbowkit";
import Hero from './Hero';
import Features from './Features';

const Links = [
  {name: 'Dashboard',
  url: '/dashboard'
},
{
  name: 'Create NFT', 
  url: '/create-nft',
},
{
  name:  'Buy NFT',
  url: '/buy-nft',
},
{
  name: 'List NFT',
  url: '/list-nft'
},
{
  name:  'Rewards',
  url: '/rewards'
}
  
 
];

const NavLink = ({ name, url }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={url}>
    {name}
  </Link>
);

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box width={"100vw"} bg={useColorModeValue("gray.800", "gray: 800")} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'} color={'whiteAlpha.900'}>
            <Link href='/' display={{ base: 'none', md: 'flex' }}> Evveland Marketplace </Link>
            <HStack
              as={'nav'}
              spacing={4}
              color={'whiteAlpha.900'}
              display={{ base: 'none', md: 'flex' }}>
              {Links.map((link, i) => (
                <NavLink key={i} url={link.url} name={link.name}>{link.name}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
          <ConnectButton />
            {/* <Button
              variant={'solid'}
              colorScheme={'teal'}
              size={'sm'}
              mr={4}
              leftIcon={<AddIcon />}>
                Create NFT
              
            </Button> */}
            
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <Avatar
                  size={'sm'}
                  src={
                    'https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                  }
                />
              </MenuButton>
              <MenuList>
                <MenuItem>Profile</MenuItem>
                <MenuItem>My Collections</MenuItem>
                <MenuDivider />
                <MenuItem>Favourites</MenuItem>
                <MenuItem>Watchlist</MenuItem>
                <MenuItem>Settings</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>

    </>
  );
}