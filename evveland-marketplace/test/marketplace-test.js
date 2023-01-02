/** martketplace-test.js */
const { expect } = require("chai");
const hre = require("hardhat")
require('regenerator-runtime/runtime');

describe("EvvelandMarketPlace", function () {
    it("Should create and execute market sales", async function () {
        /** deploy the marketplace contract */
        const EvvelandMarketplace = await hre.ethers.getContractFactory('EvvelandMarketplace')
        const marketplace = await EvvelandMarketplace.deploy()

        await marketplace.deployed()

        console.log('Deployed marketplace address: ', marketplace.address)

        let listingPrice = await marketplace.getListingPrice()
        listingPrice = listingPrice.toString()

        const auctionPrice = hre.ethers.utils.parseUnits('1', 'ether')


        /* create two tokens */
        await marketplace.createToken("https://marketplace.evveland.com/token1", auctionPrice, { value: listingPrice })
        await marketplace.createToken("https://marketplace.evveland.com/token2", auctionPrice, { value: listingPrice })

        const [_, buyerAddress] =  await hre.ethers.getSigners()

        /** execute sale of token to another user */
        await marketplace.connect(buyerAddress).createMarketSale(1, {value: auctionPrice})

        /** resell a token */
        await marketplace.connect(buyerAddress).resellToken(1, auctionPrice, {value: listingPrice})

        /** query for and return the unsold items */
        items = await marketplace.fetchMarketItems()
        items = await Promise.all(items.map(async i => {
            const  tokenUri = await marketplace.tokenURI(i.tokenId)
            let item = {
                price: i.price.toString(),
                tokenId: i.tokenId.toString(),
                seller: i.seller,
                owner: i.owner,
                tokenUri
            }
            return item
        }))
    
        console.log('returned items: ', items)

        listedItems = await  marketplace.fetchItemsListed()

    })
})