// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./PixieEnums.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";

contract Pixie is ERC1155 {
    struct User {
        bool exists;
        uint256[] myFiles;
    }
    struct File {
        uint256 id;
        address owner;
        bool accessTokens;
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

    event fileCreated(uint256 indexed fileId);

    constructor() payable ERC1155("") {
        owner = payable(msg.sender);
        console.log("Contract deployed, owner set");
    }

    // utility functions
    function createFile() public {
        uint256 id = fileId.current();
        fileId.increment();
        File memory tempFile = File(id, msg.sender, false);

        idToFile[id] = tempFile;
        addressToUser[msg.sender].myFiles.push(id);
        emit fileCreated(id);

        // emit event - get transaction - add event - use etherjs - subscribe to a topic
    }

    // function to mint nfts for a file in our system fileId = tokenId
    function mint(
        uint256 id, // supply file id that will act as tokenId as well
        uint256 amount,
        bool updateUri,
        string memory newuri
    ) public payable {
        require(
            idToFile[id].owner == msg.sender,
            "You are not the owner of the file"
        );
        _mint(msg.sender, id, amount, "");
        if (updateUri == true) {
            _setURI(newuri);
        }
        if (!idToFile[id].accessTokens) {
            idToFile[id].accessTokens = true;
        }
    }

    function getFiles() public view userExists returns (File[] memory) {
        address user = msg.sender;
        File[] memory myFiles = new File[](addressToUser[user].myFiles.length);
        for (uint256 i = 0; i < addressToUser[user].myFiles.length; i++) {
            myFiles[i] = idToFile[addressToUser[user].myFiles[i]];
        }
        return myFiles;
    }

    function getFile(uint256 _id) public view returns (File memory) {
        return idToFile[_id];
    }
}
