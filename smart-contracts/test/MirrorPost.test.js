const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MirrorPost", function () {
  let MirrorPost, mirrorPost, owner, addr1, addr2;

  beforeEach(async function () {
    MirrorPost = await ethers.getContractFactory("MirrorPost");
    [owner, addr1, addr2] = await ethers.getSigners();
    mirrorPost = await MirrorPost.deploy();
    await mirrorPost.waitForDeployment();
  });

  describe("Sub-Community Management", function () {
    it("Should create a sub-community with valid inputs", async function () {
      const tx = await mirrorPost.createSubCommunity("Tech", "Tech discussions");
      const receipt = await tx.wait();
      const subCommunity = await mirrorPost.getSubCommunity(1);

      expect(subCommunity.subCommunityId).to.equal(1);
      expect(subCommunity.name).to.equal("Tech");
      expect(subCommunity.description).to.equal("Tech discussions");
      expect(subCommunity.creator).to.equal(owner.address);

      // Verify event
      expect(receipt.logs).to.have.lengthOf(1);
      const event = receipt.logs[0];
      const parsed = mirrorPost.interface.parseLog(event);
      expect(parsed.name).to.equal("SubCommunityCreated");
      expect(parsed.args.subCommunityId).to.equal(1);
      expect(parsed.args.name).to.equal("Tech");
      expect(parsed.args.description).to.equal("Tech discussions");
      expect(parsed.args.creator).to.equal(owner.address);
    });

    it("Should fail to create sub-community with invalid name", async function () {
      await expect(
        mirrorPost.createSubCommunity("", "Tech discussions")
      ).to.be.revertedWith("Name must be 3-50 characters");

      await expect(
        mirrorPost.createSubCommunity("A".repeat(51), "Tech discussions")
      ).to.be.revertedWith("Name must be 3-50 characters");
    });

    it("Should fail to create sub-community with invalid description", async function () {
      await expect(
        mirrorPost.createSubCommunity("Tech", "")
      ).to.be.revertedWith("Description must be 10-200 characters");

      await expect(
        mirrorPost.createSubCommunity("Tech", "A".repeat(201))
      ).to.be.revertedWith("Description must be 10-200 characters");
    });

    it("Should increment subCommunityCount", async function () {
      await mirrorPost.createSubCommunity("Tech", "Tech discussions");
      await mirrorPost.createSubCommunity("Gaming", "Gaming discussions");
      expect(await mirrorPost.subCommunityCount()).to.equal(2);
    });

    it("Should retrieve all sub-communities", async function () {
      await mirrorPost.createSubCommunity("Tech", "Tech discussions");
      await mirrorPost.createSubCommunity("Gaming", "Gaming discussions");
      const subCommunities = await mirrorPost.getAllSubCommunities();
      expect(subCommunities).to.have.lengthOf(2);
      expect(subCommunities[0].name).to.equal("Tech");
      expect(subCommunities[1].name).to.equal("Gaming");
    });

    it("Should fail to get non-existent sub-community", async function () {
      await expect(mirrorPost.getSubCommunity(1)).to.be.revertedWith("Sub-community does not exist");
    });
  });

  describe("User Management", function () {
    it("Should set and update username", async function () {
      await mirrorPost.setUsername("User#1234");
      let user = await mirrorPost.getUser(owner.address);
      expect(user.username).to.equal("User#1234");
      expect(user.exists).to.equal(true);

      // Verify event
      const receipt = await mirrorPost.setUsername("User#5678").then(tx => tx.wait());
      user = await mirrorPost.getUser(owner.address);
      expect(user.username).to.equal("User#5678");
      expect(user.exists).to.equal(true);

      const event = receipt.logs[0];
      const parsed = mirrorPost.interface.parseLog(event);
      expect(parsed.name).to.equal("UsernameSet");
      expect(parsed.args.user).to.equal(owner.address);
      expect(parsed.args.username).to.equal("User#5678");
    });

    it("Should fail to set invalid username", async function () {
      await expect(mirrorPost.setUsername("")).to.be.revertedWith("Username must be 3-20 characters");
      await expect(mirrorPost.setUsername("A".repeat(21))).to.be.revertedWith("Username must be 3-20 characters");
    });

    it("Should fail to set duplicate username", async function () {
      await mirrorPost.setUsername("User#1234");
      await expect(
        mirrorPost.connect(addr1).setUsername("User#1234")
      ).to.be.revertedWith("Username already taken");
    });

    it("Should allow reusing username after update", async function () {
      await mirrorPost.setUsername("User#1234");
      await mirrorPost.setUsername("User#5678");
      await mirrorPost.connect(addr1).setUsername("User#1234");
      const user = await mirrorPost.getUser(addr1.address);
      expect(user.username).to.equal("User#1234");
      expect(user.exists).to.equal(true);
    });
  });

  describe("Post Management", function () {
    beforeEach(async function () {
      await mirrorPost.createSubCommunity("Tech", "Tech discussions");
      await mirrorPost.setUsername("User#1234");
    });

    it("Should create a post with valid inputs", async function () {
      const tx = await mirrorPost.createPost(1, "Hello, world!");
      const receipt = await tx.wait();
      const post = await mirrorPost.getPost(1);

      expect(post.postId).to.equal(1);
      expect(post.subCommunityId).to.equal(1);
      expect(post.author).to.equal(owner.address);
      expect(post.username).to.equal("User#1234");
      expect(post.content).to.equal("Hello, world!");
      expect(post.likes).to.equal(0);
      expect(post.isDeleted).to.equal(false);
      expect(post.exists).to.equal(true);

      // Verify event
      const event = receipt.logs[0];
      const parsed = mirrorPost.interface.parseLog(event);
      expect(parsed.name).to.equal("PostCreated");
      expect(parsed.args.postId).to.equal(1);
      expect(parsed.args.subCommunityId).to.equal(1);
      expect(parsed.args.author).to.equal(owner.address);
      expect(parsed.args.username).to.equal("User#1234");
      expect(parsed.args.content).to.equal("Hello, world!");
    });

    it("Should fail to create post without username", async function () {
      const mirrorPostNoUsername = mirrorPost.connect(addr1);
      await expect(
        mirrorPostNoUsername.createPost(1, "Hello, world!")
      ).to.be.revertedWith("User must set a username");
    });

    it("Should fail to create post in non-existent sub-community", async function () {
      await expect(
        mirrorPost.createPost(2, "Hello, world!")
      ).to.be.revertedWith("Sub-community does not exist");
    });

    it("Should fail to create post with invalid content", async function () {
      await expect(
        mirrorPost.createPost(1, "")
      ).to.be.revertedWith("Content must be 1-1000 characters");

      await expect(
        mirrorPost.createPost(1, "A".repeat(1001))
      ).to.be.revertedWith("Content must be 1-1000 characters");
    });

    it("Should increment postCount", async function () {
      await mirrorPost.createPost(1, "Post 1");
      await mirrorPost.createPost(1, "Post 2");
      expect(await mirrorPost.postCount()).to.equal(2);
    });

    it("Should track posts in sub-community", async function () {
      await mirrorPost.createPost(1, "Post 1");
      await mirrorPost.createPost(1, "Post 2");
      const posts = await mirrorPost.getPostsInSubCommunity(1);
      expect(posts).to.have.lengthOf(2);
      expect(posts[0].content).to.equal("Post 1");
      expect(posts[1].content).to.equal("Post 2");
    });

    it("Should like a post", async function () {
      await mirrorPost.createPost(1, "Hello, world!");
      const tx = await mirrorPost.connect(addr1).likePost(1);
      const receipt = await tx.wait();
      const post = await mirrorPost.getPost(1);
      expect(post.likes).to.equal(1);

      // Verify event
      const event = receipt.logs[0];
      const parsed = mirrorPost.interface.parseLog(event);
      expect(parsed.name).to.equal("PostLiked");
      expect(parsed.args.postId).to.equal(1);
      expect(parsed.args.liker).to.equal(addr1.address);
      expect(parsed.args.likes).to.equal(1);
    });

    it("Should allow multiple likes on a post", async function () {
      await mirrorPost.createPost(1, "Hello, world!");
      await mirrorPost.connect(addr1).likePost(1);
      await mirrorPost.connect(addr2).likePost(1);
      const post = await mirrorPost.getPost(1);
      expect(post.likes).to.equal(2);
    });

    it("Should fail to like non-existent post", async function () {
      await expect(mirrorPost.likePost(1)).to.be.revertedWith("Post does not exist");
    });

    it("Should fail to like deleted post", async function () {
      await mirrorPost.createPost(1, "Hello, world!");
      await mirrorPost.deletePost(1);
      await expect(mirrorPost.likePost(1)).to.be.revertedWith("Post is deleted");
    });

    it("Should delete a post as moderator", async function () {
      await mirrorPost.createPost(1, "Hello, world!");
      const tx = await mirrorPost.deletePost(1);
      const receipt = await tx.wait();
      const post = await mirrorPost.getPost(1);
      expect(post.isDeleted).to.equal(true);

      // Verify event
      const event = receipt.logs[0];
      const parsed = mirrorPost.interface.parseLog(event);
      expect(parsed.name).to.equal("PostDeleted");
      expect(parsed.args.postId).to.equal(1);
      expect(parsed.args.moderator).to.equal(owner.address);
    });

    it("Should fail to delete post as non-moderator", async function () {
      await mirrorPost.createPost(1, "Hello, world!");
      await expect(
        mirrorPost.connect(addr1).deletePost(1)
      ).to.be.revertedWith("Only sub-community creator can perform this action");
    });

    it("Should fail to delete non-existent post", async function () {
      await expect(mirrorPost.deletePost(1)).to.be.revertedWith("Post does not exist");
    });

    it("Should fail to delete already deleted post", async function () {
      await mirrorPost.createPost(1, "Hello, world!");
      await mirrorPost.deletePost(1);
      await expect(mirrorPost.deletePost(1)).to.be.revertedWith("Post already deleted");
    });

    it("Should not include deleted posts in sub-community", async function () {
      await mirrorPost.createPost(1, "Post 1");
      await mirrorPost.createPost(1, "Post 2");
      await mirrorPost.deletePost(1);
      const posts = await mirrorPost.getPostsInSubCommunity(1);
      expect(posts).to.have.lengthOf(1);
      expect(posts[0].postId).to.equal(2);
    });
  });

  describe("Comment Management", function () {
    beforeEach(async function () {
      await mirrorPost.createSubCommunity("Tech", "Tech discussions");
      await mirrorPost.setUsername("User#1234");
      await mirrorPost.createPost(1, "Hello, world!");
    });

    it("Should create a comment with valid inputs", async function () {
      const tx = await mirrorPost.createComment(1, "Great post!");
      const receipt = await tx.wait();
      const comments = await mirrorPost.getComments(1);

      expect(comments).to.have.lengthOf(1);
      expect(comments[0].commentId).to.equal(1);
      expect(comments[0].postId).to.equal(1);
      expect(comments[0].subCommunityId).to.equal(1);
      expect(comments[0].author).to.equal(owner.address);
      expect(comments[0].username).to.equal("User#1234");
      expect(comments[0].content).to.equal("Great post!");
      expect(comments[0].likes).to.equal(0);
      expect(comments[0].isDeleted).to.equal(false);

      // Verify event
      const event = receipt.logs[0];
      const parsed = mirrorPost.interface.parseLog(event);
      expect(parsed.name).to.equal("CommentCreated");
      expect(parsed.args.commentId).to.equal(1);
      expect(parsed.args.postId).to.equal(1);
      expect(parsed.args.subCommunityId).to.equal(1);
      expect(parsed.args.author).to.equal(owner.address);
      expect(parsed.args.username).to.equal("User#1234");
      expect(parsed.args.content).to.equal("Great post!");
    });

    it("Should fail to create comment without username", async function () {
      const mirrorPostNoUsername = mirrorPost.connect(addr1);
      await expect(
        mirrorPostNoUsername.createComment(1, "Great post!")
      ).to.be.revertedWith("User must set a username");
    });

    it("Should fail to create comment on non-existent post", async function () {
      await expect(
        mirrorPost.createComment(2, "Great post!")
      ).to.be.revertedWith("Post does not exist");
    });

    it("Should fail to create comment on deleted post", async function () {
      await mirrorPost.deletePost(1);
      await expect(
        mirrorPost.createComment(1, "Great post!")
      ).to.be.revertedWith("Post is deleted");
    });

    it("Should fail to create comment with invalid content", async function () {
      await expect(
        mirrorPost.createComment(1, "")
      ).to.be.revertedWith("Content must be 1-500 characters");

      await expect(
        mirrorPost.createComment(1, "A".repeat(501))
      ).to.be.revertedWith("Content must be 1-500 characters");
    });

    it("Should increment commentCount", async function () {
      await mirrorPost.createComment(1, "Comment 1");
      await mirrorPost.createComment(1, "Comment 2");
      expect(await mirrorPost.commentCount()).to.equal(2);
    });

    it("Should like a comment", async function () {
      await mirrorPost.createComment(1, "Great post!");
      const tx = await mirrorPost.connect(addr1).likeComment(1, 1);
      const receipt = await tx.wait();
      const comments = await mirrorPost.getComments(1);
      expect(comments[0].likes).to.equal(1);

      // Verify event
      const event = receipt.logs[0];
      const parsed = mirrorPost.interface.parseLog(event);
      expect(parsed.name).to.equal("CommentLiked");
      expect(parsed.args.postId).to.equal(1);
      expect(parsed.args.commentId).to.equal(1);
      expect(parsed.args.liker).to.equal(addr1.address);
      expect(parsed.args.likes).to.equal(1);
    });

    it("Should allow multiple likes on a comment", async function () {
      await mirrorPost.createComment(1, "Great post!");
      await mirrorPost.connect(addr1).likeComment(1, 1);
      await mirrorPost.connect(addr2).likeComment(1, 1);
      const comments = await mirrorPost.getComments(1);
      expect(comments[0].likes).to.equal(2);
    });

    it("Should fail to like non-existent comment", async function () {
      await expect(mirrorPost.likeComment(1, 1)).to.be.revertedWith("Comment does not exist");
    });

    it("Should fail to like deleted comment", async function () {
      await mirrorPost.createComment(1, "Great post!");
      await mirrorPost.deleteComment(1, 1);
      await expect(mirrorPost.likeComment(1, 1)).to.be.revertedWith("Comment is deleted");
    });

    it("Should delete a comment as moderator", async function () {
      await mirrorPost.createComment(1, "Great post!");
      const tx = await mirrorPost.deleteComment(1, 1);
      const receipt = await tx.wait();
      const comments = await mirrorPost.getComments(1);
      expect(comments.length).to.equal(0); // No non-deleted comments

      // Debug logs
      console.log("Receipt logs:", receipt.logs.map(log => ({
        topics: log.topics,
        data: log.data
      })));

      // Verify event
      const event = receipt.logs.find(log => {
        try {
          const parsed = mirrorPost.interface.parseLog(log);
          return parsed.name === "CommentDeleted";
        } catch (e) {
          console.error("Failed to parse log:", log, e);
          return false;
        }
      });
      expect(event, "CommentDeleted event not found").to.not.be.undefined;
      const parsed = mirrorPost.interface.parseLog(event);
      expect(parsed.name).to.equal("CommentDeleted");
      expect(parsed.args.postId).to.equal(1);
      expect(parsed.args.commentId).to.equal(1);
      expect(parsed.args.moderator).to.equal(owner.address);
    });

    it("Should fail to delete comment as non-moderator", async function () {
      await mirrorPost.createComment(1, "Great post!");
      await expect(
        mirrorPost.connect(addr1).deleteComment(1, 1)
      ).to.be.revertedWith("Only sub-community creator can perform this action");
    });

    it("Should fail to delete non-existent comment", async function () {
      await expect(mirrorPost.deleteComment(1, 1)).to.be.revertedWith("Comment does not exist");
    });

    it("Should fail to delete already deleted comment", async function () {
      await mirrorPost.createComment(1, "Great post!");
      await mirrorPost.deleteComment(1, 1);
      await expect(mirrorPost.deleteComment(1, 1)).to.be.revertedWith("Comment already deleted");
    });

    it("Should not include deleted comments in getComments", async function () {
      await mirrorPost.createComment(1, "Comment 1");
      await mirrorPost.createComment(1, "Comment 2");
      await mirrorPost.deleteComment(1, 1);
      const comments = await mirrorPost.getComments(1);
      expect(comments).to.have.lengthOf(1);
      expect(comments[0].commentId).to.equal(2);
    });
  });

  describe("Edge Cases and State Interactions", function () {
    it("Should handle multiple posts and comments in a sub-community", async function () {
      await mirrorPost.createSubCommunity("Tech", "Tech discussions");
      await mirrorPost.setUsername("User#1234");

      // Create multiple posts
      await mirrorPost.createPost(1, "Post 1");
      await mirrorPost.createPost(1, "Post 2");

      // Create comments on each post
      await mirrorPost.createComment(1, "Comment on Post 1");
      await mirrorPost.createComment(2, "Comment on Post 2");

      // Like posts and comments
      await mirrorPost.connect(addr1).likePost(1);
      await mirrorPost.connect(addr2).likePost(2);
      await mirrorPost.connect(addr1).likeComment(1, 1);
      await mirrorPost.connect(addr2).likeComment(2, 2);

      // Verify state
      const posts = await mirrorPost.getPostsInSubCommunity(1);
      expect(posts).to.have.lengthOf(2);
      expect(posts[0].likes).to.equal(1);
      expect(posts[1].likes).to.equal(1);

      const comments1 = await mirrorPost.getComments(1);
      const comments2 = await mirrorPost.getComments(2);
      expect(comments1).to.have.lengthOf(1);
      expect(comments2).to.have.lengthOf(1);
      expect(comments1[0].likes).to.equal(1);
      expect(comments2[0].likes).to.equal(1);
    });

    it("Should maintain state after deletions", async function () {
      await mirrorPost.createSubCommunity("Tech", "Tech discussions");
      await mirrorPost.setUsername("User#1234");

      // Create posts and comments
      await mirrorPost.createPost(1, "Post 1");
      await mirrorPost.createPost(1, "Post 2");
      await mirrorPost.createComment(1, "Comment 1");
      await mirrorPost.createComment(1, "Comment 2");

      // Delete one post and one comment
      await mirrorPost.deletePost(1);
      await mirrorPost.deleteComment(1, 1);

      // Verify state
      const posts = await mirrorPost.getPostsInSubCommunity(1);
      expect(posts).to.have.lengthOf(1);
      expect(posts[0].postId).to.equal(2);

      const comments = await mirrorPost.getComments(1);
      expect(comments).to.have.lengthOf(1);
      expect(comments[0].commentId).to.equal(2);
    });
  });
});