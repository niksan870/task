// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

contract Wallet {
    struct Order {
        uint blockNumber;
        uint amount;
        uint16 quantity;
    } 

    mapping(address => mapping(string => Order)) internal orders;
    mapping(address => uint256) internal clientsBalance;

    function getClientBalance(address _clientAddress) external view returns (uint) {
        return clientsBalance[_clientAddress];
    }
}