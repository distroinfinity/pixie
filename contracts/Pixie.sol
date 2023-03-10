// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./PixieEnums.sol";

contract Pixie {
    struct User {
        string name;
        bool exists;
        uint256[] myFiles;
    }
    struct File {
        uint256 id;
        address owner;
        string content;
        Access access;
    }

    modifier onlyAuthor(uint256 _id) {
        require(
            msg.sender == idToFile[_id].owner,
            "You are not the owner of this file"
        );
        _;
    }
    modifier userExists() {
        require(addressToUser[msg.sender].exists, "User Does not exist");
        _;
    }
    address payable public owner;

    using Counters for Counters.Counter;
    Counters.Counter private fileId;

    mapping(uint256 => File) private idToFile;
    mapping(address => User) private addressToUser;

    constructor() payable {
        owner = payable(msg.sender);
        console.log("Contract deployed, owner set");
    }

    // utility functions
    function createFile() public userExists {
        uint256 id = fileId.current();
        fileId.increment();
        File memory tempFile = File(id, msg.sender, "abc", Access.Private);
        console.log("file created", id);
        idToFile[id] = tempFile;
        addressToUser[msg.sender].myFiles.push(id);
    }

    function createUser() public returns (User memory) {
        //check if user already exists
        require(!addressToUser[msg.sender].exists, "User Already exist");

        User memory tempUser;
        tempUser.name = "testUser";
        tempUser.exists = true;
        addressToUser[msg.sender] = tempUser;
        return tempUser;
    }

    // getter setter
    //get user
    function getUser(address _user) public view returns (User memory) {
        return addressToUser[_user];
    }

    // get file
    function getFile(uint256 _id) public view returns (File memory) {
        return idToFile[_id];
    }

    // get visibility of a file
    function checkAccess(uint256 _id) public view returns (Access) {
        return idToFile[_id].access;
    }

    // change access of a file
    function changeAccess(uint256 _id, Access _access) public onlyAuthor(_id) {
        idToFile[_id].access = _access;
    }
}
