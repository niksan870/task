// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

library Errors {
    error DubplicateProduct();
    error PriceDosntEqualRequiredAmount();
    error NotOwner();
    error NegativeQuantity();
    error EmptyName();
    error ProductNotPresent();
    error ExpiredReturnTime();
    error NewPriceIntroduced();
    error FailedTransaction();
}


library Constants {
    string constant CREATE = "CREATE";
    string constant UPDATE = "UPDATE";
    string constant BUY = "BUY";
    string constant DELETE = "DELETE";

    uint constant RETURN_DURATION = 100;
}