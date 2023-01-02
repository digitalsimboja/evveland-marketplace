"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/** martketplace-test.js */
var _require = require("chai"),
    expect = _require.expect;

var hre = require("hardhat");

require('regenerator-runtime/runtime');

describe("EvvelandMarketPlace", function () {
  it("Should create and execute market sales", function _callee2() {
    var EvvelandMarketplace, marketplace, listingPrice, auctionPrice, _ref, _ref2, _, buyerAddress;

    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(hre.ethers.getContractFactory('EvvelandMarketplace'));

          case 2:
            EvvelandMarketplace = _context2.sent;
            _context2.next = 5;
            return regeneratorRuntime.awrap(EvvelandMarketplace.deploy());

          case 5:
            marketplace = _context2.sent;
            _context2.next = 8;
            return regeneratorRuntime.awrap(marketplace.deployed());

          case 8:
            console.log('Deployed marketplace address: ', marketplace.address);
            _context2.next = 11;
            return regeneratorRuntime.awrap(marketplace.getListingPrice());

          case 11:
            listingPrice = _context2.sent;
            listingPrice = listingPrice.toString();
            auctionPrice = hre.ethers.utils.parseUnits('1', 'ether');
            /* create two tokens */

            _context2.next = 16;
            return regeneratorRuntime.awrap(marketplace.createToken("https://marketplace.evveland.com/token1", auctionPrice, {
              value: listingPrice
            }));

          case 16:
            _context2.next = 18;
            return regeneratorRuntime.awrap(marketplace.createToken("https://marketplace.evveland.com/token2", auctionPrice, {
              value: listingPrice
            }));

          case 18:
            _context2.next = 20;
            return regeneratorRuntime.awrap(hre.ethers.getSigners());

          case 20:
            _ref = _context2.sent;
            _ref2 = _slicedToArray(_ref, 2);
            _ = _ref2[0];
            buyerAddress = _ref2[1];
            _context2.next = 26;
            return regeneratorRuntime.awrap(marketplace.connect(buyerAddress).createMarketSale(1, {
              value: auctionPrice
            }));

          case 26:
            _context2.next = 28;
            return regeneratorRuntime.awrap(marketplace.connect(buyerAddress).resellToken(1, auctionPrice, {
              value: listingPrice
            }));

          case 28:
            _context2.next = 30;
            return regeneratorRuntime.awrap(marketplace.fetchMarketItems());

          case 30:
            items = _context2.sent;
            _context2.next = 33;
            return regeneratorRuntime.awrap(Promise.all(items.map(function _callee(i) {
              var tokenUri, item;
              return regeneratorRuntime.async(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.next = 2;
                      return regeneratorRuntime.awrap(marketplace.tokenURI(i.tokenId));

                    case 2:
                      tokenUri = _context.sent;
                      item = {
                        price: i.price.toString(),
                        tokenId: i.tokenId.toString(),
                        seller: i.seller,
                        owner: i.owner,
                        tokenUri: tokenUri
                      };
                      return _context.abrupt("return", item);

                    case 5:
                    case "end":
                      return _context.stop();
                  }
                }
              });
            })));

          case 33:
            items = _context2.sent;
            console.log('returned items: ', items);
            _context2.next = 37;
            return regeneratorRuntime.awrap(marketplace.fetchItemsListed());

          case 37:
            listedItems = _context2.sent;

          case 38:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
});