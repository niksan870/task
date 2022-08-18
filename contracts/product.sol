// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;
import "hardhat/console.sol";

import "./owner.sol";
import "./utils.sol";

contract Product is Owner {
    struct Item {
        string name;
        uint16 quantity;
        uint16 price;
    }

    mapping(string => Item) internal products;
    string[] internal productsIterable;

    event ProductEvent(string);

    modifier addProductModifier(string calldata _name, uint16 _quantity, uint16 _price) {
        if (_quantity <= 0)
            revert Errors.NegativeQuantity();

        if (bytes(_name).length <= 0)
            revert Errors.EmptyName();

        if (products[_name].quantity != 0 && products[_name].price != _price) 
            revert Errors.NewPriceIntroduced();
        _;
    }

    function addProduct(string calldata _name, uint16 _quantity, uint16 _price) external isOwner addProductModifier(_name, _quantity, _price) {
        if (bytes(products[_name].name).length == 0) {
            products[_name] = Item(_name, _quantity, _price);
            productsIterable.push(_name);
            emit ProductEvent(Constants.CREATE);
        } else {
            products[_name].quantity += _quantity;
            emit ProductEvent(Constants.UPDATE);
        }
    }

    function getAvailableProducts() external view returns (string[] memory) {
        return productsIterable;
    }

    function _getAccumolatedPriceOrder(uint _quantity, uint _price) internal pure returns (uint) {
        return _quantity * _price;
    }
}