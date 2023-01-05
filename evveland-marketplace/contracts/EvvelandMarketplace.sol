// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EvvelandMarketplace is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Pausable,
    Ownable,
    ERC721Burnable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;
    Counters.Counter private _listedItems;

    uint256 listingPrice = 0.025 ether;

    mapping(string => bool) private _usedTokenURIs;
    mapping(uint256 => MarketItem) private idToMarketItem;

    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;
    mapping(uint256 => uint256) private _idToOwnedIndex;

    uint256[] private _allNfts;
    mapping(uint256 => uint256) private _idToNftIndex;

    struct MarketItem {
        uint256 tokenId;
        address payable creator;
        uint256 price;
        bool isListed;
        uint256 refID;
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        uint256 price,
        address creator,
        bool isListed,
        uint256 refID
    );

    constructor() ERC721("Evveland Marketplace", "EVVE") {}

    /* Updates the listing price of the item in the contract */
    function updateListingPrice(uint256 _newListingPrice)
        external
        payable
        onlyOwner
    {
        require(_newListingPrice > 0, "Price must be at least 1 wei");
        listingPrice = _newListingPrice;
    }

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* Returns listed item count */
    function getListedItemsCount() public view returns (uint256) {
        return _listedItems.current();
    }

    function tokenURIExists(string memory _uri) public view returns (bool) {
        return _usedTokenURIs[_uri] == true;
    }

    function totalSupply() public view override returns (uint256) {
        return _allNfts.length;
    }

    function tokenByIndex(uint256 index)
        public
        view
        override
        returns (uint256)
    {
        require(index < totalSupply(), "Index out of bounds");
        return _allNfts[index];
    }

    function tokenOfOwnerByIndex(address owner, uint256 index)
        public
        view
        override
        returns (uint256)
    {
        require(index < ERC721.balanceOf(owner), "Index out of bounds");
        return _ownedTokens[owner][index];
    }

    function getAllNftsOnSale() public view returns (MarketItem[] memory) {
        uint256 allItemsCounts = totalSupply();
        uint256 currentIndex = 0;
        MarketItem[] memory items = new MarketItem[](_listedItems.current());

        for (uint256 i = 0; i < allItemsCounts; i++) {
            uint256 tokenId = tokenByIndex(i);
            MarketItem storage item = idToMarketItem[tokenId];

            if (item.isListed == true) {
                items[currentIndex] = item;
                currentIndex += 1;
            }
        }

        return items;
    }

    function getOwnedNfts() public view returns (MarketItem[] memory) {
        uint256 ownedItemsCount = ERC721.balanceOf(msg.sender);
        MarketItem[] memory items = new MarketItem[](ownedItemsCount);

        for (uint256 i = 0; i < ownedItemsCount; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(msg.sender, i);
            MarketItem storage item = idToMarketItem[tokenId];
            items[i] = item;
        }

        return items;
    }

    /* Mints a new token and lists it in the marketplace */
    function mintToken(string memory _tokenURI, uint256 price)
        public
        payable
        returns (uint256)
    {
        require(!tokenURIExists(_tokenURI), "Token URI already exists");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        _tokenIds.increment();
        _listedItems.increment();

        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        _createNftItem(newTokenId, price);
        _usedTokenURIs[_tokenURI] = true;

        return newTokenId;
    }

    function _createNftItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be at least 1 wei");

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            price,
            true,
            0
        );

        emit MarketItemCreated(tokenId, price, msg.sender, true, 0);
    }

    function buyNft(uint256 tokenId) public payable {
        uint256 price = idToMarketItem[tokenId].price;
        address owner = ERC721.ownerOf(tokenId);

        require(msg.sender != owner, "You already own this NFT");
        require(msg.value == price, "Please submit the asking price");

        idToMarketItem[tokenId].isListed = false;
        _listedItems.decrement();

        _transfer(owner, msg.sender, tokenId);
        payable(owner).transfer(msg.value);
    }

    function placeNftOnSale(uint256 tokenId, uint256 newPrice) public payable {
        require(
            ERC721.ownerOf(tokenId) == msg.sender,
            "You are not owner of this nft"
        );
        require(
            idToMarketItem[tokenId].isListed == false,
            "Item is already on sale"
        );
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        idToMarketItem[tokenId].isListed = true;
        idToMarketItem[tokenId].price = newPrice;
        _listedItems.increment();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(
        address to,
        uint256 tokenId,
        string memory uri
    ) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function withdraw(address _addr) external onlyOwner {
        uint256 balance = address(this).balance;
        payable(_addr).transfer(balance);
    }
}
