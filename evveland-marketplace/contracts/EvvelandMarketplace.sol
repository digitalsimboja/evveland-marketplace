// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract EvvelandMarketplace is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _listedItems;
    Counters.Counter private _tokenIds;

    uint256 public listingPrice = 0.025 ether;

    mapping(string => bool) private _usedTokenURI;
    mapping(uint256 => MarketItem) private _tokenIdToMarketItem;

    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;
    mapping(uint256 => uint256) private _tokenIdTOwnedIndex;

    uint256[] private _totalMarketItems;
    mapping(uint256 => uint256) private _tokenIdToNFTIndex;

    struct MarketItem {
        uint256 tokenId;
        address payable owner;
        uint256 price;
        bool isListed;
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        uint256 price,
        address owner,
        bool isListed
    );

    event MarketItemPurchased(
        uint256 indexed tokenId,
        uint256 price,
        address buyer,
        bool isListed
    );

    event MarketItemListed(
        uint256 indexed tokenId,
        uint256 price,
        address owner,
        bool isListed
    );

    constructor() ERC721("Evveland Metaverse Marketplace", "EVVE") {}

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

    function checkTokenURIExists(string memory _uri)
        public
        view
        returns (bool)
    {
        return _usedTokenURI[_uri] == true;
    }

    function totalSupply() public view returns (uint256) {
        return _totalMarketItems.length;
    }

    function tokenByIndex(uint256 index) public view returns (uint256) {
        require(index < totalSupply(), "Index out of bounds");
        return _totalMarketItems[index];
    }

    function getTokenOfOwnerByIndex(address owner, uint256 index)
        public
        view
        returns (uint256)
    {
        require(index < ERC721.balanceOf(owner), "Index out of bounds");
        return _ownedTokens[owner][index];
    }

    function getAllListedMarketItems()
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 allItemsCounts = totalSupply();
        uint256 currentIndex = 0;
        MarketItem[] memory items = new MarketItem[](_listedItems.current());

        for (uint256 i = 0; i < allItemsCounts; i++) {
            uint256 tokenId = tokenByIndex(i);
            MarketItem storage item = _tokenIdToMarketItem[tokenId];

            if (item.isListed == true) {
                items[currentIndex] = item;
                currentIndex += 1;
            }
        }

        return items;
    }

    function getUserOwnedNfts() public view returns (MarketItem[] memory) {
        uint256 ownedItemsCount = ERC721.balanceOf(msg.sender);
        MarketItem[] memory items = new MarketItem[](ownedItemsCount);

        for (uint256 i = 0; i < ownedItemsCount; i++) {
            uint256 tokenId = getTokenOfOwnerByIndex(msg.sender, i);
            MarketItem storage item = _tokenIdToMarketItem[tokenId];
            items[i] = item;
        }

        return items;
    }

    /** Function to create and list an NFT on the marketplace */
    function createMarketItem(string memory _uri, uint256 price)
        public
        payable
        returns (uint256)
    {
        require(!checkTokenURIExists(_uri), "Token URI already exists");
        require(
            msg.value == listingPrice,
            "Listing Fee supplied must be equal to listing price"
        );
        _tokenIds.increment();
        _listedItems.increment();

        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _uri);
        _mintMarketItem(newTokenId, price);
        _usedTokenURI[_uri] = true;

        return newTokenId;
    }

    function _mintMarketItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be at least 1 wei");

        _tokenIdToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            price,
            true
        );

        emit MarketItemCreated(tokenId, price, msg.sender, true);
    }

    function buyNFT(uint256 tokenId) public payable {
        uint256 price = _tokenIdToMarketItem[tokenId].price;
        address owner = ERC721.ownerOf(tokenId);

        require(msg.sender != owner, "You already own this NFT");
        require(msg.value == price, "Please submit the asking price");

        _tokenIdToMarketItem[tokenId].isListed = false;

        _listedItems.decrement();

        _transfer(owner, msg.sender, tokenId);
        payable(owner).transfer(msg.value);

        _tokenIdToMarketItem[tokenId].owner = payable(msg.sender);

        emit MarketItemPurchased(tokenId, price, msg.sender, false);
    }

    function placeNFTonSale(uint256 tokenId, uint256 newPrice) public payable {
        require(
            ERC721.ownerOf(tokenId) == msg.sender,
            "You are not owner of this NFT"
        );
        require(
            _tokenIdToMarketItem[tokenId].isListed == false,
            "Item is already on sale"
        );
        require(
            msg.value == listingPrice,
            "Listing fee paid must be equal to listing price"
        );
        _tokenIdToMarketItem[tokenId].isListed = true;
        _tokenIdToMarketItem[tokenId].price = newPrice;
        _listedItems.increment();

        emit MarketItemListed(tokenId, newPrice, msg.sender, true);
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        if (from == address(0)) {
            _addTokenToAllTokensEnumeration(tokenId);
        } else if (from != to) {
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }

        if (to == address(0)) {
            _removeTokenFromAllTokensEnumeration(tokenId);
        } else if (to != from) {
            _addTokenToOwnerEnumeration(to, tokenId);
        }
    }

    function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
        _tokenIdToNFTIndex[tokenId] = _totalMarketItems.length;
        _totalMarketItems.push(tokenId);
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        uint256 length = ERC721.balanceOf(to);
        _ownedTokens[to][length] = tokenId;
        _tokenIdTOwnedIndex[tokenId] = length;
    }

    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId)
        private
    {
        uint256 lastTokenIndex = ERC721.balanceOf(from) - 1;
        uint256 tokenIndex = _tokenIdTOwnedIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];

            _ownedTokens[from][tokenIndex] = lastTokenId;
            _tokenIdTOwnedIndex[lastTokenId] = tokenIndex;
        }

        delete _tokenIdTOwnedIndex[tokenId];
        delete _ownedTokens[from][lastTokenIndex];
    }

    function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {
        uint256 lastTokenIndex = _totalMarketItems.length - 1;
        uint256 tokenIndex = _tokenIdToNFTIndex[tokenId];
        uint256 lastTokenId = _totalMarketItems[lastTokenIndex];

        _totalMarketItems[tokenIndex] = lastTokenId;
        _tokenIdToNFTIndex[lastTokenId] = tokenIndex;

        delete _tokenIdToNFTIndex[tokenId];
        _totalMarketItems.pop();
    }

    function withdraw(address _addr) external onlyOwner {
        uint256 balance = address(this).balance;
        payable(_addr).transfer(balance);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
