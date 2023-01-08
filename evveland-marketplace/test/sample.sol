pragma solidity ^0.8.9;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/GSN/Context.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC721/SafeERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/utils/Address.sol";
import "./EvvelandMarketplace.sol";

// Test suite for the EvvelandMarketplace smart contract
contract TestEvvelandMarketplace {
    using Context for Context.Context;
    using SafeERC721 for SafeERC721.SafeERC721;
    using SafeMath for uint256;
    using Address for Address.Address;

    // Test variables
    EvvelandMarketplace evvelandMarketplace;
    address payable owner;
    address payable alice;
    address payable bob;
    bytes32 uri1 = "https://evveland.com/item1";
    bytes32 uri2 = "https://evveland.com/item2";
    bytes32 uri3 = "https://evveland.com/item3";
    bytes32 uri4 = "https://evveland.com/item4";
    uint256 price = 100;
    uint256 itemId1;
    uint256 itemId2;
    uint256 itemId3;
    uint256 itemId4;
    uint256 itemId5;

    // Set up function, called before each test
    function beforeEach() public {
        // Deploy the EvvelandMarketplace contract
        owner = msg.sender;
        evvelandMarketplace = new EvvelandMarketplace();
        alice = address(new Context());
        bob = address(new Context());
    }

    // Test the updateListingPrice function
    function testUpdateListingPrice() public {
        // Ensure the owner can update the listing price
        evvelandMarketplace.updateListingPrice(price);
        assert(evvelandMarketplace.getListingPrice() == price, "Listing price was not updated");

        // Ensure only the owner can update the listing price
        Context ctx = new Context();
        ctx.setSender(bob);
        ctx.useGSN(true);
        SafeERC721 evvelandMarketplaceGSN = SafeERC721(evvelandMarketplace);
        assert(evvelandMarketplaceGSN.updateListingPrice(price).revert(), "Non-owner was able to update the listing price");
    }

    // Test the checkTokenURIExists function
    function testCheckTokenURIExists() public {
        // Create a market item with URI1
        itemId1 = evvelandMarketplace.createMarketItem(uri1, price, false);
        // Check if URI1 exists
        assert(evvelandMarketplace.checkTokenURIExists(uri1), "URI1 was not found to exist");
        // Check if URI2

// Test the getListedItemsCount function
function testGetListedItemsCount() public {
    // Create a market item with URI1 and list it
    itemId1 = evvelandMarketplace.createMarketItem(uri1, price, true);
    // Create a market item with URI2 and do not list it
    itemId2 = evvelandMarketplace.createMarketItem(uri2, price, false);
    // Check that only one item is listed
    assert(evvelandMarketplace.getListedItemsCount() == 1, "Incorrect number of listed items");
}

// Test the createMarketItem function
function testCreateMarketItem() public {
    // Create a market item with URI1
    itemId1 = evvelandMarketplace.createMarketItem(uri1, price, false);
    // Check that the item was created and stored correctly
    MarketItem storage item = evvelandMarketplace._tokenIdToMarketItem[itemId1];
    assert(item.tokenId == itemId1, "Incorrect token ID for market item");
    assert(item.owner == owner, "Incorrect owner for market item");
    assert(item.price == price, "Incorrect price for market item");
    assert(item.isListed == false, "Incorrect listed status for market item");

    // Ensure that the same URI cannot be used for multiple items
    assert(evvelandMarketplace.createMarketItem(uri1, price, false).revert(), "Same URI was used for multiple items");
}

// Test the getAllListedMarketItems function
function testGetAllListedMarketItems() public {
    // Create a market item with URI1 and list it
    itemId1 = evvelandMarketplace.createMarketItem(uri1, price, true);
    // Create a market item with URI2 and do not list it
    itemId2 = evvelandMarketplace.createMarketItem(uri2, price, false);
    // Create a market item with URI3 and list it
    itemId3 = evvelandMarketplace.createMarketItem(uri3, price, true);
    // Create a market item with URI4 and do not list it
    itemId4 = evvelandMarketplace.createMarketItem(uri4, price, false);

    // Get all listed items
    MarketItem[] memory listedItems = evvelandMarketplace.getAllListedMarketItems();
    // Check that only the listed items are returned
    assert(listedItems.length == 2, "Incorrect number of listed items returned");
    assert(listedItems[0].tokenId == itemId1, "Incorrect token ID for first listed item");
    assert(listedItems[1].tokenId == itemId3, "Incorrect token ID for second listed item");
}

// Test the getUserOwnedNfts function
function testGetUserOwnedNfts() public {
    // Create a market item with URI1 and transfer it to Alice
    itemId1 = evvelandMarketplace.createMarketItem(uri1, price, false);
    evvelandMarketplace.transferFrom(owner, alice, itemId1);
    // Create a market item with URI2 and transfer it to Bob
    itemId2 = evvelandMarketplace.createMarketItem(uri2, price, false);
    evvelandMarketplace.transferFrom(owner, bob

    // Get Alice's owned NFTs
    MarketItem[] memory aliceNFTs = evvelandMarketplace.getUserOwnedNfts();
    // Check that Alice has only one NFT
    assert(aliceNFTs.length == 1, "Incorrect number of NFTs owned by Alice");
    assert(aliceNFTs[0].tokenId == itemId1, "Incorrect token ID for NFT owned by Alice");

    // Get Bob's owned NFTs
    MarketItem[] memory bobNFTs = evvelandMarketplace.getUserOwnedNfts(bob);
    // Check that Bob has only one NFT
    assert(bobNFTs.length == 1, "Incorrect number of NFTs owned by Bob");
    assert(bobNFTs[0].tokenId == itemId2, "Incorrect token ID for NFT owned by Bob");
}

// Test the getMarketItem function
function testGetMarketItem() public {
    // Create a market item with URI1
    itemId1 = evvelandMarketplace.createMarketItem(uri1, price, false);
    // Get the market item
    MarketItem storage item = evvelandMarketplace.getMarketItem(itemId1);
    // Check that the item was returned correctly
    assert(item.tokenId == itemId1, "Incorrect token ID for market item");
    assert(item.owner == owner, "Incorrect owner for market item");
    assert(item.price == price, "Incorrect price for market item");
    assert(item.isListed == false, "Incorrect listed status for market item");

    // Ensure that an error is thrown for a non-existent item
    assert(evvelandMarketplace.getMarketItem(itemId2).revert(), "Non-existent market item was retrieved");
}

// Test the getMarketItemPrice function
function testGetMarketItemPrice() public {
    // Create a market item with URI1
    itemId1 = evvelandMarketplace.createMarketItem(uri1, price, false);
    // Get the market item price
    uint256 marketItemPrice = evvelandMarketplace.getMarketItemPrice(itemId1);
    // Check that the correct price was returned
    assert(marketItemPrice == price, "Incorrect price returned for market item");

    // Ensure that an error is thrown for a non-existent item
    assert(evvelandMarketplace.getMarketItemPrice(itemId2).revert(), "Price returned for non-existent market item");
}

// Test the listMarketItem function
function testListMarketItem() public {
    // Create a market item with URI1
    itemId1 = evvelandMarketplace.createMarketItem(uri1, price, false);
    // List the market item
    evvelandMarketplace.listMarketItem(itemId1, true);
    // Get the market item
    MarketItem storage item = evlanderMarketplace.getMarketItem(itemId1);
    // Check that the item is now listed
    assert(item.isListed == true, "Market item was not listed");

    // Ensure that an error is thrown for a non-existent item
    assert(evlanderMarketplace.listMarketItem(itemId2, true).revert(), "Non-existent market item was listed");

// Test the purchaseMarketItem function
function testPurchaseMarketItem() public {
    // Create a market item with URI1 and list it
    itemId1 = evvelandMarketplace.createMarketItem(uri1, price, true);
    // Purchase the market item
    evvelandMarketplace.purchaseMarketItem(itemId1);
    // Get the market item
    MarketItem storage item = evlanderMarketplace.getMarketItem(itemId1);
    // Check that the item was purchased and the price was paid
    assert(item.owner == alice, "Market item was not purchased");
    assert(item.price == 0, "Price was not paid for market item");

    // Ensure that an error is thrown for a non-existent item
    assert(evlanderMarketplace.purchaseMarketItem(itemId2).revert(), "Non-existent market item was purchased");
    // Ensure that an error is thrown for a non-listed item
    itemId3 = evvelandMarketplace.createMarketItem(uri2, price, false);
    assert(evlanderMarketplace.purchaseMarketItem(itemId3).revert(), "Non-listed market item was purchased");
}

// Test the transferFrom function
function testTransferFrom() public {
    // Create a market item with URI1
    itemId1 = evvelandMarketplace.createMarketItem(uri1, price, false);
    // Transfer the market item to Alice
    evvelandMarketplace.transferFrom(owner, alice, itemId1);
    // Get the market item
    MarketItem storage item = evlanderMarketplace.getMarketItem(itemId1);
    // Check that the item was transferred to Alice
    assert(item.owner == alice, "Market item was not transferred to Alice");

    // Ensure that an error is thrown for a non-existent item
    assert(evlanderMarketplace.transferFrom(owner, alice, itemId2).revert(), "Non-existent market item was transferred");
}

// Test the safeTransferFrom function
function testSafeTransferFrom() public {
    // Create a market item with URI1
    itemId1 = evvelandMarketplace.createMarketItem(uri1, price, false);
    // Transfer the market item to Alice
    evvelandMarketplace.safeTransferFrom(owner, alice, itemId1);
    // Get the market item
    MarketItem storage item = evlanderMarketplace.getMarketItem(itemId1);
    // Check that the item was transferred to Alice
    assert(item.owner == alice, "Market item was not transferred to Alice");

    // Ensure that an error is thrown for a non-existent item
    assert(evlanderMarketplace.safeTransferFrom(owner, alice, itemId2).revert(), "Non-existent market item was transferred");
}

// Test the approve function
function testApprove() public {
    // Create a market item with URI1
   

itemId1 = evvelandMarketplace.createMarketItem(uri1, price, false);
    // Approve Alice to transfer the market item
    evvelandMarketplace.approve(alice, itemId1);
    // Check that Alice is approved to transfer the item
    assert(evvelandMarketplace.getApproved(itemId1) == alice, "Alice was not approved to transfer the market item");

    // Ensure that an error is thrown for a non-existent item
    assert(evvelandMarketplace.approve(alice, itemId2).revert(), "Approval given for non-existent market item");
}

// Test the setApprovalForAll function
function testSetApprovalForAll() public {
    // Create a market item with URI1
    itemId1 = evvelandMarketplace.createMarketItem(uri1, price, false);
    // Approve Alice to transfer all of the owner's market items
    evvelandMarketplace.setApprovalForAll(alice, true);
    // Check that Alice is approved to transfer the item
    assert(evvelandMarketplace.isApprovedForAll(owner, alice) == true, "Alice was not approved to transfer all of the owner's market items");

    // Ensure that the approval can be revoked
    evvelandMarketplace.setApprovalForAll(alice, false);
    assert(evvelandMarketplace.isApprovedForAll(owner, alice) == false, "Alice's approval to transfer all of the owner's market items was not revoked");
}

// Test the transferOwnership function
function testTransferOwnership() public {
    // Transfer ownership of the contract to Alice
    evvelandMarketplace.transferOwnership(alice);
    // Check that Alice is the new owner
    assert(evvelandMarketplace.owner() == alice, "Alice was not set as the new owner of the contract");

    // Ensure that an error is thrown if a non-owner tries to transfer ownership
    assert(evvelandMarketplace.transferOwnership(bob).revert(), "Non-owner was able to transfer ownership of the contract");
}

