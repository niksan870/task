// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

library Errors {
    error DubplicateProduct();
    error PriceDoesntEqualRequiredAmount();
    error NotOwner();
    error NegativeQuantity();
    error EmptyName();
    error ProductNotPresent();
    error ExpiredReturnTime();
    error NewPriceIntroduced();
    error FailedTransaction();
}


library Events {
    event MakeOrder(address indexed, string, uint, uint, uint16);
    event DiscardOrder(address, string, uint, uint, uint);

    event SellProduct(string, uint16);
    event ReturnProduct(string, uint16);
    event CreateProduct(address indexed, string, uint, uint16);
    event IncreaseProductQuantity(address indexed, string, uint);
}

library Constants {
    uint constant RETURN_DURATION = 100;
}
