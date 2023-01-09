const { expect, assert } = require('chai');

const DECIMALS = '18'
const LISTING_PRICE = '25000000000000000'

describe('Evveland Marketplace: Create Market Item and List Token', function () {
  const uri1 = "https://evvelandmarketplace.com/item1";
  const uri2 = "https://evvelandmarketplace.com/item2";
  const uri3 = "https://evvelandmarketplace.com/item3";
  const uri4 = "https://evvelandmarketplace.com/item4";
  const uri5 = "https://evvelandmarketplace.com/item5";
  const uri6 = "https://evvelandmarketplace.com/item6";
  const uri7 = "https://evvelandmarketplace.com/item7";
  const uri8 = "https://evvelandmarketplace.com/item8";

  let _nftPrice = ethers.utils.parseEther("0.3").toString();
  let _listingPrice = ethers.utils.parseEther("0.025").toString();

  before(async function () {
    EvvelandMarketplace = await ethers.getContractFactory('EvvelandMarketplace');
    evvelandMarketplace = await EvvelandMarketplace.deploy();
    await evvelandMarketplace.deployed();

    console.log("Deployed Evveland Marketplace contract: ", evvelandMarketplace.address)

    const [owner, alice, bob] = await ethers.getSigners();
    await evvelandMarketplace.createMarketItem(uri1, _nftPrice, {
      from: owner.address,
      value: _listingPrice
    })

  });

  // beforeEach(async function () {

  // });

  it('Gets the listing fee from the marketplace', async function () {
    const listingPrice = await evvelandMarketplace.getListingPrice();
    console.log('Listing price:' + new ethers.BigNumber.from(listingPrice._hex).toString())
    expect(listingPrice.toString()).to.equal(_listingPrice);
  });

  it("Owner of the first token should be the owner account", async function () {
    const [owner, alice, bob] = await ethers.getSigners();
    console.log("owner of token 1:", owner.address)
    const _owner = await evvelandMarketplace.ownerOf(1)
    expect(_owner).to.equal(owner.address)
  })

  it("Test the updateListingPrice function", async function () {
    const [owner, alice, bob] = await ethers.getSigners();
    let _newPrice = ethers.utils.parseEther("0.3").toString();
    await evvelandMarketplace.updateListingPrice(_newPrice, {
      from: owner.address
    })
    expect((await evvelandMarketplace.getListingPrice()).toString()).to.equal(_newPrice)

  })

  it("Test the checkTokenURIExists function", async function () {
    const _usedURI = await evvelandMarketplace.checkTokenURIExists(uri1)
    assert.equal(_usedURI, true, "Token URI does not exist in the marketplace")
  })

  it("Test the getListedItemsCount function", async function () {
    const [owner, alice, bob] = await ethers.getSigners();
    const fee = await evvelandMarketplace.getListingPrice()
    // Create a market item with URI2 and list it
    const tx = await evvelandMarketplace.createMarketItem(uri2, _nftPrice, {
      from: owner.address,
      value: fee
    })
    tx.wait()

    // Check that both UR1 and UR2 are listed 
    expect(await evvelandMarketplace.getListedItemsCount()).to.equal(2)
  })

  it("Test the createMarketItem function", async function () {
    const [owner, alice, bob] = await ethers.getSigners();
    const fee = await evvelandMarketplace.getListingPrice()
    // Create a market item with URI3
    tx = await evvelandMarketplace.createMarketItem(uri3, _nftPrice, {
      from: owner.address,
      value: fee
    })
    tx.wait()

    //Check that the item was created and stored correctly
    item = await evvelandMarketplace.getMarketItem(3)
    assert.equal(item.tokenId, 3, "Incorrect token ID for market item");
    assert.equal(item.owner, owner.address, "Incorrect owner for market item");
    assert.equal(item.price, _nftPrice, "Incorrect price for market item");
    assert.equal(item.isListed, true, "Incorrect listed status for market item");

  })


  // Test the getAllListedMarketItems function
  it("Test the getAllListedMarketItems function", async function () {
    const [owner, alice, bob] = await ethers.getSigners();
    const fee = await evvelandMarketplace.getListingPrice()
    // Create a market item with URI3
    tx4 = await evvelandMarketplace.createMarketItem(uri4, _nftPrice, {
      from: owner.address,
      value: fee
    })
    tx4.wait()

    tx5 = await evvelandMarketplace.createMarketItem(uri5, _nftPrice, {
      from: owner.address,
      value: fee
    })
    tx5.wait()

    tx6 = await evvelandMarketplace.createMarketItem(uri6, _nftPrice, {
      from: owner.address,
      value: fee
    })
    tx6.wait()

    // Get all listed items
    listedItems = await evvelandMarketplace.getAllListedMarketItems();

    // Check that only the listed items are returned
    assert(listedItems.length == 6, "Incorrect number of listed items returned");
    assert(listedItems[3].tokenId == 4, "Incorrect token ID for listed item");
    assert(listedItems[4].tokenId == 5, "Incorrect token ID for  listed item");
    assert(listedItems[5].tokenId == 6, "Incorrect token ID for  listed item");

  })

  // Test the getUserOwnedNfts function
  it("Test the getUserOwnedNfts function", async function () {
    const [owner, alice, bob] = await ethers.getSigners();
    const fee = await evvelandMarketplace.getListingPrice()
    // Create a market item with URI3
    tx7 = await evvelandMarketplace.createMarketItem(uri7, _nftPrice, {
      from: owner.address,
      value: fee
    })
    tx7.wait()

    tx8 = await evvelandMarketplace.createMarketItem(uri8, _nftPrice, {
      from: owner.address,
      value: fee
    })
    tx8.wait()

    ownerNFTs = await evvelandMarketplace.getUserOwnedNfts();
    assert.equal(ownerNFTs.length, 8, "Incorrect number of NFTs owned by owner")

    // Transfer 1 NFT to Alice
    // await evvelandMarketplace.transferFrom(owner.address, alice.address, 7)
    // assert.equal(ownerNFTs.length, 8, "Incorrect number of NFTs owned by owner")

    // // Transer 1 NFT to Bob
    // await evvelandMarketplace.transferFrom(owner.address, bob.address, 7)
    // assert.equal(ownerNFTs.length, 6, "Incorrect number of NFTs owned by owner")

  })




});