import { Box, Container, chakra, Divider, SimpleGrid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import EvvelandMarketplace from "../public/contracts/EvvelandMarketplace.json";
import NFTItem from "./NFTItem";

const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
const abi = EvvelandMarketplace.abi;

export default function Marketplace() {

    const data = [
        {
            name: "NFT#1",
            description: "Alchemy's First NFT",
            image: "https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
            price: "0.03ETH",
            isListed: "True",
            owner: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
            meta: {
                attributes: [
                    { trait_type: "location", value: "Evveland Metaverse" },
                    { trait_type: "status", value: "Active" },
                    { trait_type: "event", value: "Evveland Metaverse Event" },
                ]
            }
        },
        {
            name: "NFT#2",
            description: "Alchemy's Second NFT",
            image: "https://gateway.pinata.cloud/ipfs/QmdhoL9K8my2vi3fej97foiqGmJ389SMs55oC5EdkrxF2M",
            price: "0.03ETH",
            isListed: "True",
            owner: "0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
            meta: {
                attributes: [
                    { trait_type: "location", value: "Evveland Metaverse" },
                    { trait_type: "status", value: "Active" },
                    { trait_type: "event", value: "Evveland Metaverse Event" },
                ]
            }
        },
        {
            name: "NFT#3",
            description: "Alchemy's Third NFT",
            image: "https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
            price: "0.03ETH",
            isListed: "True",
            owner: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
            meta: {
                attributes: [
                    { trait_type: "location", value: "Evveland Metaverse" },
                    { trait_type: "status", value: "Active" },
                    { trait_type: "event", value: "Evveland Metaverse Event" },
                ]
            }
        },
        {
            name: "NFT#4",
            description: "Alchemy's Fourth NFT",
            image: "https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
            price: "0.03ETH",
            isListed: "True",
            owner: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
            meta: {
                attributes: [
                    { trait_type: "location", value: "Evveland Metaverse" },
                    { trait_type: "status", value: "Active" },
                    { trait_type: "event", value: "Evveland Metaverse Event" },
                ]
            }
        },
        {
            name: "NFT#5",
            description: "Alchemy's Fifth NFT",
            image: "https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
            price: "0.03ETH",
            isListed: "True",
            owner: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
            meta: {
                attributes: [
                    { trait_type: "location", value: "Evveland Metaverse" },
                    { trait_type: "status", value: "Active" },
                    { trait_type: "event", value: "Evveland Metaverse Event" },
                ]
            }
        },
    ];
    return (
        <>
           <Box as={Container} maxW="7xl" mt={5} p={4}>
            <Divider mt={12} mb={4} />
            <chakra.h3 mb={4} fontSize="4xl" fontWeight={"extrabold"} color={"white"}>Top NFTs</chakra.h3>
            <SimpleGrid columns={[12, null, 4]} spacing="40px" mb={4}>
                {data && data.map((nft, index) => {
                    return <NFTItem item={nft} key={index} />
                })}

            </SimpleGrid>

           </Box>
        </>
    )
}