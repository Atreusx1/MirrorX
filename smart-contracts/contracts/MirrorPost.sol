// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MirrorPost {
    // Structs
    struct Post {
        uint256 postId;
        uint256 subCommunityId;
        address author;
        string username;
        string content;
        uint256 timestamp;
        uint256 likes;
        bool isDeleted;
        bool exists;
    }

    struct Comment {
        uint256 commentId;
        uint256 postId;
        uint256 subCommunityId;
        address author;
        string username;
        string content;
        uint256 timestamp;
        uint256 likes;
        bool isDeleted;
    }

    struct SubCommunity {
        uint256 subCommunityId;
        string name;
        string description;
        address creator;
    }

    struct User {
        string username;
        bool exists;
    }

    // State variables
    uint256 public postCount;
    uint256 public commentCount;
    uint256 public subCommunityCount;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(uint256 => Comment)) public comments;
    mapping(uint256 => SubCommunity) public subCommunities;
    mapping(address => User) public users;
    mapping(string => address) private usernameToAddress;
    mapping(uint256 => uint256[]) public subCommunityPosts;

    // Events
    event PostCreated(
        uint256 indexed postId,
        uint256 indexed subCommunityId,
        address indexed author,
        string username,
        string content,
        uint256 timestamp
    );
    event CommentCreated(
        uint256 indexed commentId,
        uint256 indexed postId,
        uint256 indexed subCommunityId,
        address author,
        string username,
        string content,
        uint256 timestamp
    );
    event SubCommunityCreated(
        uint256 indexed subCommunityId,
        string name,
        string description,
        address creator
    );
    event UsernameSet(address indexed user, string username);
    event PostLiked(uint256 indexed postId, address indexed liker, uint256 likes);
    event CommentLiked(uint256 indexed postId, uint256 indexed commentId, address indexed liker, uint256 likes);
    event PostDeleted(uint256 indexed postId, address indexed moderator);
    event CommentDeleted(uint256 indexed postId, uint256 indexed commentId, address indexed moderator);

    // Modifiers
    modifier onlySubCommunityCreator(uint256 subCommunityId) {
        require(subCommunities[subCommunityId].creator == msg.sender, "Only sub-community creator can perform this action");
        _;
    }

    modifier validUsername(string memory username) {
        require(bytes(username).length >= 3 && bytes(username).length <= 20, "Username must be 3-20 characters");
        require(usernameToAddress[username] == address(0) || usernameToAddress[username] == msg.sender, "Username already taken");
        _;
    }

    // Functions
    function createPost(uint256 subCommunityId, string memory content) external {
        require(subCommunities[subCommunityId].creator != address(0), "Sub-community does not exist");
        require(bytes(content).length > 0 && bytes(content).length <= 1000, "Content must be 1-1000 characters");
        require(users[msg.sender].exists, "User must set a username");
        postCount++;
        posts[postCount] = Post({
            postId: postCount,
            subCommunityId: subCommunityId,
            author: msg.sender,
            username: users[msg.sender].username,
            content: content,
            timestamp: block.timestamp,
            likes: 0,
            isDeleted: false,
            exists: true
        });
        subCommunityPosts[subCommunityId].push(postCount);
        emit PostCreated(postCount, subCommunityId, msg.sender, users[msg.sender].username, content, block.timestamp);
    }

    function likePost(uint256 postId) external {
        require(posts[postId].author != address(0), "Post does not exist");
        require(!posts[postId].isDeleted, "Post is deleted");
        posts[postId].likes++;
        emit PostLiked(postId, msg.sender, posts[postId].likes);
    }

    function createComment(uint256 postId, string memory content) external {
        require(posts[postId].author != address(0), "Post does not exist");
        require(!posts[postId].isDeleted, "Post is deleted");
        require(bytes(content).length > 0 && bytes(content).length <= 500, "Content must be 1-500 characters");
        require(users[msg.sender].exists, "User must set a username"); // Added check
        commentCount++;
        comments[postId][commentCount] = Comment({
            commentId: commentCount,
            postId: postId,
            subCommunityId: posts[postId].subCommunityId,
            author: msg.sender,
            username: users[msg.sender].username,
            content: content,
            timestamp: block.timestamp,
            likes: 0,
            isDeleted: false
        });
        emit CommentCreated(commentCount, postId, posts[postId].subCommunityId, msg.sender, users[msg.sender].username, content, block.timestamp);
    }

    function likeComment(uint256 postId, uint256 commentId) external {
        require(posts[postId].author != address(0), "Post does not exist");
        require(comments[postId][commentId].author != address(0), "Comment does not exist");
        require(!comments[postId][commentId].isDeleted, "Comment is deleted");
        comments[postId][commentId].likes++;
        emit CommentLiked(postId, commentId, msg.sender, comments[postId][commentId].likes);
    }

    function createSubCommunity(string memory name, string memory description) external {
        require(bytes(name).length >= 3 && bytes(name).length <= 50, "Name must be 3-50 characters");
        require(bytes(description).length >= 10 && bytes(description).length <= 200, "Description must be 10-200 characters");
        subCommunityCount++;
        subCommunities[subCommunityCount] = SubCommunity({
            subCommunityId: subCommunityCount,
            name: name,
            description: description,
            creator: msg.sender
        });
        emit SubCommunityCreated(subCommunityCount, name, description, msg.sender);
    }

    function setUsername(string memory username) external validUsername(username) {
        if (users[msg.sender].exists) {
            string memory oldUsername = users[msg.sender].username;
            delete usernameToAddress[oldUsername];
        }
        users[msg.sender] = User({ username: username, exists: true });
        usernameToAddress[username] = msg.sender;
        emit UsernameSet(msg.sender, username);
    }

    function deletePost(uint256 postId) external {
        require(posts[postId].author != address(0), "Post does not exist"); // Moved before modifier
        require(!posts[postId].isDeleted, "Post already deleted");
        require(subCommunities[posts[postId].subCommunityId].creator == msg.sender, "Only sub-community creator can perform this action"); // Inline check
        posts[postId].isDeleted = true;
        emit PostDeleted(postId, msg.sender);
    }

    function deleteComment(uint256 postId, uint256 commentId) external {
        require(comments[postId][commentId].author != address(0), "Comment does not exist"); // Moved before modifier
        require(!comments[postId][commentId].isDeleted, "Comment already deleted");
        require(subCommunities[posts[postId].subCommunityId].creator == msg.sender, "Only sub-community creator can perform this action"); // Inline check
        comments[postId][commentId].isDeleted = true;
        emit CommentDeleted(postId, commentId, msg.sender);
    }

    // Getter functions
    function getPost(uint256 postId) external view returns (Post memory) {
        require(posts[postId].exists, "Post does not exist");
        return posts[postId];
    }

    function getPostsInSubCommunity(uint256 subCommunityId) external view returns (Post[] memory) {
        require(subCommunities[subCommunityId].creator != address(0), "Sub-community does not exist");
        uint256[] storage postIds = subCommunityPosts[subCommunityId];
        uint256 count = 0;
        for (uint256 i = 0; i < postIds.length; i++) {
            if (!posts[postIds[i]].isDeleted) {
                count++;
            }
        }
        Post[] memory result = new Post[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < postIds.length; i++) {
            if (!posts[postIds[i]].isDeleted) {
                result[index] = posts[postIds[i]];
                index++;
            }
        }
        return result;
    }

    function getComments(uint256 postId) external view returns (Comment[] memory) {
        require(posts[postId].author != address(0), "Post does not exist");
        uint256 count = 0;
        for (uint256 i = 1; i <= commentCount; i++) {
            if (comments[postId][i].postId == postId && !comments[postId][i].isDeleted) {
                count++;
            }
        }
        Comment[] memory result = new Comment[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= commentCount; i++) {
            if (comments[postId][i].postId == postId && !comments[postId][i].isDeleted) {
                result[index] = comments[postId][i];
                index++;
            }
        }
        return result;
    }

    function getSubCommunity(uint256 subCommunityId) external view returns (SubCommunity memory) {
        require(subCommunities[subCommunityId].creator != address(0), "Sub-community does not exist");
        return subCommunities[subCommunityId];
    }

    function getAllSubCommunities() external view returns (SubCommunity[] memory) {
        SubCommunity[] memory result = new SubCommunity[](subCommunityCount);
        for (uint256 i = 1; i <= subCommunityCount; i++) {
            result[i - 1] = subCommunities[i];
        }
        return result;
    }

    function getUser(address user) external view returns (User memory) {
        return users[user];
    }
}