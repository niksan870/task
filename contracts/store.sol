// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import "./wallet.sol";
import "./product.sol";
import "./utils.sol";
import "hardhat/console.sol";


contract Store is Wallet, Product {
    mapping(string => address[]) internal prodcutClientsHaveBought;
    mapping(string => mapping(address => bool)) internal prodcutClientsHaveBoughtInsertable;


    modifier buyProductModifier(string calldata _prodName, uint _quantity) {
        uint productPrice = products[_prodName].price;

        if (products[_prodName].quantity <= _quantity)
            revert Errors.NegativeQuantity();
        
        if (orders[msg.sender][_prodName].amount != 0)
            revert Errors.DubplicateProduct();
        
        if (msg.value != _getAccumolatedPriceOrder(_quantity, productPrice))
            revert Errors.PriceDoesntEqualRequiredAmount();
        _;
    }

    modifier returnProductModifier(string calldata _prodName) {
        Order memory order = orders[msg.sender][_prodName];
        if (order.quantity <= 0)
            revert Errors.ProductNotPresent();

        if((block.number - order.blockNumber) > Constants.RETURN_DURATION)
            revert Errors.ExpiredReturnTime();
        _;
    }

    function buyProduct(string calldata _prodName, uint16 _quantity) external payable buyProductModifier(_prodName, _quantity) {
        _productClientBoughtSet(_prodName);

        products[_prodName].quantity -= _quantity;
        emit Events.SellProduct(_prodName, _quantity);

        orders[msg.sender][_prodName] = Order(_prodName, block.number, msg.value, _quantity);
        emit Events.MakeOrder(msg.sender, _prodName, msg.value, _quantity);        
        
        clientsBalance[msg.sender] += msg.value;
    }

    function returnProduct(string calldata _prodName) external returnProductModifier(_prodName) {
        Order storage order = orders[msg.sender][_prodName];

        products[_prodName].quantity += order.quantity;
        emit Events.ReturnProduct(_prodName, products[_prodName].quantity);

        clientsBalance[msg.sender] -= order.amount;
        
        emit Events.DiscardOrder(msg.sender, _prodName, order.quantity, order.amount);        
        delete orders[msg.sender][_prodName];        

        (bool sent, ) = payable(msg.sender).call{value: order.amount}("");
        if (!sent)
            revert Errors.FailedTransaction();
    }

    function _productClientBoughtSet(string calldata _prodName) internal {
        if (!prodcutClientsHaveBoughtInsertable[_prodName][msg.sender]) {
            prodcutClientsHaveBoughtInsertable[_prodName][msg.sender] = true;
            prodcutClientsHaveBought[_prodName].push(msg.sender);
        }
    }

    function getClientsHaveEverBougthAProduct(string calldata _prodName) external view returns(address[] memory) {
        return prodcutClientsHaveBought[_prodName];
    }
}