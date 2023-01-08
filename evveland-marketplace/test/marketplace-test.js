const { expect, assert } = require('chai');

const DECIMALS = '18'
const LISTING_PRICE = '25000000000000000'

describe('Evveland Marketplace: Create Market Item and List Token', function () {
  const uri1 = "https://evvelandmarketplace.com/item1";
  const uri2 = "https://evvelandmarketplace.com/item2";
  const uri3 = "https://evvelandmarketplace.com/item3";
  const uri4 = "https://evvelandmarketplace.com/item4";

  let _nftPrice = ethers.utils.parseEther("0.3").toString();
  let _listingPrice = ethers.utils.parseEther("0.025").toString();

  before(async function () {
    EvvelandMarketplace = await ethers.getContractFactory('EvvelandMarketplace');
    marketplace = await EvvelandMarketplace.deploy();
    await marketplace.deployed();

    console.log("Deployed Evveland Marketplace contract: ", marketplace.address)

    const [owner, alice, bob] = await ethers.getSigners();
    await marketplace.createMarketItem(uri1, _nftPrice, {
      from: owner.address,
      value: _listingPrice
    })

  });

  // beforeEach(async function () {


  // });

  it('Gets the listing fee from the marketplace', async function () {
    listingPrice = await marketplace.getListingPrice();
    console.log('Listing price:' + new ethers.BigNumber.from(listingPrice._hex).toString())
    expect(listingPrice.toString()).to.equal(_listingPrice);
  });

  it("Owner of the first token should be the owner account", async function () {
    const [owner, alice, bob] = await ethers.getSigners();
    console.log("owner of token 1:", owner.address)
    const _owner = await marketplace.ownerOf(1)
    expect(_owner).to.equal(owner.address)
  })
  
  it("Test the updateListingPrice function", async function () {
    const [owner, alice, bob] = await ethers.getSigners();
    let _newPrice = ethers.utils.parseEther("0.3").toString();
    await marketplace.updateListingPrice(_newPrice, {
      from: owner.address
    })
    expect((await marketplace.getListingPrice()).toString()).to.equal(_newPrice)

  })
});