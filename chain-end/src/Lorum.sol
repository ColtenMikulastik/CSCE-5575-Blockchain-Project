// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Lorum {
    string[] public loremIpsumArray;
    uint256 public num;
    
    constructor() {
        // Initialize with sample data
        loremIpsumArray = [
            "Lorem", "ipsum", "dolor", "sit", "amet",
            "consectetur", "adipiscing", "elit", "sed", "do"
        ];
        num = 0;
    }
    
    function setArray(string[] memory _array) public {
        loremIpsumArray = _array;
    }
    
    function setNum(uint256 _num) public {
        num = _num;
    }
    
    function getSlice() public view returns(string[] memory) {
        if (num == 0) {
            return new string[](0);
        }
        
        uint256 arrayLength = loremIpsumArray.length;
        uint256 sliceLength = num > arrayLength ? arrayLength : num;
        
        string[] memory slice = new string[](sliceLength);
        for (uint256 i = 0; i < sliceLength; i++) {
            slice[i] = loremIpsumArray[i];
        }
        
        return slice;
    }
    
    function getArray() public view returns(string[] memory) {
        return loremIpsumArray;
    }
}