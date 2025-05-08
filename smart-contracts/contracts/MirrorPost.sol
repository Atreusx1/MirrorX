// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MirrorPost {
    struct Post {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
    }

    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(address => bool)) public likes;
    uint256 public postCount;

    event PostCreated(uint256 id, address author, string content, uint256 timestamp);
    event PostLiked(uint256 id, address liker);

    function createPost(string calldata _content) external {
        require(bytes(_content).length > 0, "Content cannot be empty");
        postCount++;
        posts[postCount] = Post(postCount, msg.sender, _content, block.timestamp, 0);
        emit PostCreated(postCount, msg.sender, _content, block.timestamp);
    }

    function likePost(uint256 _postId) external {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        require(!likes[_postId][msg.sender], "Already liked");
        likes[_postId][msg.sender] = true;
        posts[_postId].likes++;
        emit PostLiked(_postId, msg.sender);
    }

    function getPost(uint256 _postId) external view returns (Post memory) {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        return posts[_postId];
    }

    function getAllPosts() external view returns (Post[] memory) {
        Post[] memory allPosts = new Post[](postCount);
        for (uint256 i = 1; i <= postCount; i++) {
            allPosts[i - 1] = posts[i];
        }
        return allPosts;
    }
}