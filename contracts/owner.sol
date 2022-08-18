// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import "./utils.sol";


contract Owner {
    address internal owner;

    event OwnerEvent(address indexed oldOwner, address indexed newOwner);

    modifier isOwner() {
        if (msg.sender != owner)
            revert Errors.NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender; 
        emit OwnerEvent(address(0), owner);
    }

    function changeOwner(address newOwner) public isOwner {
        emit OwnerEvent(owner, newOwner);
        owner = newOwner;
    }

    function getOwner() external view returns (address) {
        return owner;
    }
} 