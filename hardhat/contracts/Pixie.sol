// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./PixieEnums.sol";

contract Pixie {
    struct User {
        // string name;
        bool exists;
        uint256[] myFiles;
    }
    struct File {
        uint256 id;
        address owner;
        // string content;
        // Access access;
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
    function createFile() public {
        uint256 id = fileId.current();
        fileId.increment();
        File memory tempFile = File(id, msg.sender);

        idToFile[id] = tempFile;
        addressToUser[msg.sender].myFiles.push(id);

        console.log("new item id ", id);
        // return id;
    }

    // function createUser() public {
    //     //check if user already exists
    //     require(!addressToUser[msg.sender].exists, "User Already exist");

    //     User memory tempUser;
    //     // tempUser.name = "testUser";
    //     tempUser.exists = true;
    //     addressToUser[msg.sender] = tempUser;
    // }

    // getter setter
    //get user
    // function getUser(address _user) public view returns (User memory) {
    //     return addressToUser[_user];
    // }

    // get file
    function getFiles() public view userExists returns (File[] memory) {
        address user = msg.sender;
        File[] memory myFiles = new File[](addressToUser[user].myFiles.length);
        for (uint256 i = 0; i < addressToUser[user].myFiles.length; i++) {
            myFiles[i] = idToFile[addressToUser[user].myFiles[i]];
        }
        return myFiles;
    }

    // get visibility of a file
    // function checkAccess(uint256 _id) public view returns (Access) {
    //     return idToFile[_id].access;
    // }

    // change access of a file
    // function changeAccess(uint256 _id, Access _access) public onlyAuthor(_id) {
    //     idToFile[_id].access = _access;
    // }

    function getCurrentFileId() public view returns (uint256) {
        return fileId.current();
    }
}
