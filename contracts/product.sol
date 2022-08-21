// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import "./owner.sol";
import "./utils.sol";

contract Product is Owner {
    struct Item {
        uint16 quantity;
        uint16 price;
    }

    mapping(string => Item) internal products;
    string[] internal productsIterable;


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
        if (products[_name].quantity == 0) {
            products[_name] = Item(_quantity, _price);
            productsIterable.push(_name);

            emit Events.CreateProduct(msg.sender, _name, _quantity, _price);
        } else {
            products[_name].quantity += _quantity;

            emit Events.IncreaseProductQuantity(msg.sender, _name, products[_name].quantity);
        }
    }

    function getAvailableProducts() external view returns (string[] memory) {
        return productsIterable;
    }

    function _getAccumolatedPriceOrder(uint _quantity, uint _price) internal pure returns (uint) {
        return _quantity * _price;
    }
}