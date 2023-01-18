import { Box, Image, Flex, chakra, Icon, useColorModeValue, Heading, Badge, Tooltip, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import EvvelandMarketplace from "../public/contracts/EvvelandMarketplace.json";
import { FaEthereum } from 'react-icons/fa';

const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
const abi = EvvelandMarketplace.abi;

function shortifyAddress() {
    return `0x****${contractAddress.slice(-4)}`
}

export default function NFTItem({ item, index }) {
    const buyNFT = (tokenId, price) => {
        console.log('price, price', price)

    }
    return (
        <>
            <Box
                key={index}
                item={item}
                mb={4}
                maxW="sm"
                borderWidth="1px"
                borderRadius="2xl"
                position="relative"
            >
                <Box>
                    <Image
                        alt=""
                        src={item.image}
                        width="0"
                        height="0"
                        sizes="100vw"
                        // blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcPHltPQAF6AJU4aqirgAAAABJRU5ErkJggg=="
                        // placeholder="blur"
                        style={{ width: "100%", height: "auto" }}
                    />
                    <Box p={6}>
                        <Box d="flex" alignItems="baseline">
                            <Badge rounded="full" px="2" fontSize="0.8em" colorScheme="red"  >New</Badge>
                        </Box>
                        <Flex mt={1} justifyContent="space-between" alignContent="center">
                            <Box
                                fontSize="2xl"
                                fontWeight="semibold"
                                as="h4"
                                lineHeight="tight"
                                color={"white"}
                                isTruncated
                            >
                                {item.name}
                            </Box>
                            <Tooltip
                                label="Ethereum NFT"
                                bg="white"
                                placement={'top'}
                                color={'gray.800'}
                                fontSize={'1.2em'}>
                                <chakra.a href={'#'} display={'flex'} color={"white"}>
                                    <Icon as={FaEthereum} h={7} w={7} alignSelf={'center'} />
                                </chakra.a>
                            </Tooltip>
                        </Flex>
                        <Flex justifyContent="space-between" alignContent="center">
                            {/* <Rating rating={data.rating} numReviews={data.numReviews} /> */}
                            <Box fontSize="2xm" color={useColorModeValue('white', 'white')}>
                                <Box as="span" color={'white'} fontSize="lg">
                                    $
                                </Box>
                                {item.price}
                            </Box>
                            <Button
                            onClick={() => buyNFT(item.tokenId, item.price)}
                            >Buy</Button>

                        </Flex>
                    </Box>

                </Box>


            </Box>

        </>
    )
}