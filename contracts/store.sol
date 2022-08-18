// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import "./wallet.sol";
import "./product.sol";
import "./utils.sol";


contract Store is Wallet, Product {
    modifier buyProductModifier(string calldata _prodName, uint _quantity) {
        uint productPrice = products[_prodName].price;

        if (products[_prodName].quantity <= _quantity)
            revert Errors.NegativeQuantity();
        
        if (clients[msg.sender].orders[_prodName].amount != 0)
            revert Errors.DubplicateProduct();
        
        if (msg.value != _getAccumolatedPriceOrder(_quantity, productPrice))
            revert Errors.PriceDosntEqualRequiredAmount();
        _;
    }

    modifier returnProductModifier(string calldata _prodName) {
        Order memory order = clients[msg.sender].orders[_prodName];
        if (order.quantity <= 0)
            revert Errors.ProductNotPresent();

        if((block.number - order.blockNumber) > Constants.RETURN_DURATION)
                revert Errors.ExpiredReturnTime();
        _;
    }

    function buyProduct(string calldata _prodName, uint16 _quantity) external payable buyProductModifier(_prodName, _quantity) {
        Client storage client = _addClientToSet(msg.sender);

        products[_prodName].quantity -= _quantity;
        emit ProductEvent(Constants.UPDATE);

        client.orders[_prodName] = Order(_prodName, block.number, msg.value, _quantity);
        emit PurchaseEvent(Constants.CREATE);        

        clientsBalance[msg.sender] += msg.value;
    }

    function returnProduct(string calldata _prodName) external returnProductModifier(_prodName) {
        Order storage order = clients[msg.sender].orders[_prodName];

        products[_prodName].quantity += order.quantity;
        emit ProductEvent(Constants.UPDATE);

        clientsBalance[msg.sender] -= order.amount;

        delete clients[msg.sender].orders[_prodName];
        emit PurchaseEvent(Constants.DELETE);

        (bool sent, ) = payable(msg.sender).call{value: order.amount}("");
        if (!sent)
            revert Errors.FailedTransaction();
    }
}