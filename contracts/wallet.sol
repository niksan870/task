// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

contract Wallet {
    struct Order {
        string productName;
        uint blockNumber;
        uint amount;
        uint16 quantity;
    } 

    struct Client {
        mapping(string => Order) orders;
    }

    mapping(address => Client) internal clients;
    mapping(address => bool) internal insertedClients;
    mapping(address => uint256) internal clientsBalance;
    address[] internal clientsIterable;

    event PurchaseEvent(string);

    function _addClientToSet(address _key) internal returns (Client storage) {
        Client storage client = clients[msg.sender];

        if (!insertedClients[_key]) {
            insertedClients[_key] = true;
            clientsIterable.push(_key);
        }
        return client;
    }
    
    function clientsHaveBoughtProducts() external view returns (address[] memory) {
        return clientsIterable;
    }

    function getClientBalance(address _clientAddress) external view returns (uint) {
        return clientsBalance[_clientAddress];
    }
}