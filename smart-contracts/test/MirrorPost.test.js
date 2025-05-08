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

  it("Should create a sub-community", async function () {
    await mirrorPost.createSubCommunity("Tech", "Tech discussions");
    const subCommunity = await mirrorPost.getSubCommunity(1);
    expect(subCommunity.name).to.equal("Tech");
    expect(subCommunity.description).to.equal("Tech discussions");
    expect(subCommunity.creator).to.equal(owner.address);
  });

  it("Should set and update username", async function () {
    await mirrorPost.setUsername("User#1234");
    let user = await mirrorPost.getUser(owner.address);
    expect(user.username).to.equal("User#1234");

    await mirrorPost.setUsername("User#5678");
    user = await mirrorPost.getUser(owner.address);
    expect(user.username).to.equal("User#5678");
  });

  it("Should create a post", async function () {
    await mirrorPost.createSubCommunity("Tech", "Tech discussions");
    await mirrorPost.setUsername("User#1234");
    await mirrorPost.createPost(1, "Hello, world!");
    const post = await mirrorPost.getPost(1);
    expect(post.subCommunityId).to.equal(1);
    expect(post.author).to.equal(owner.address);
    expect(post.username).to.equal("User#1234");
    expect(post.content).to.equal("Hello, world!");
  });

  it("Should like a post", async function () {
    await mirrorPost.createSubCommunity("Tech", "Tech discussions");
    await mirrorPost.createPost(1, "Hello, world!");
    await mirrorPost.connect(addr1).likePost(1);
    const post = await mirrorPost.getPost(1);
    expect(post.likes).to.equal(1);
  });

  it("Should create a comment", async function () {
    await mirrorPost.createSubCommunity("Tech", "Tech discussions");
    await mirrorPost.setUsername("User#1234");
    await mirrorPost.createPost(1, "Hello, world!");
    await mirrorPost.createComment(1, "Great post!");
    const comments = await mirrorPost.getComments(1);
    expect(comments[0].postId).to.equal(1);
    expect(comments[0].author).to.equal(owner.address);
    expect(comments[0].username).to.equal("User#1234");
    expect(comments[0].content).to.equal("Great post!");
  });

  it("Should like a comment", async function () {
    await mirrorPost.createSubCommunity("Tech", "Tech discussions");
    await mirrorPost.createPost(1, "Hello, world!");
    await mirrorPost.createComment(1, "Great post!");
    await mirrorPost.connect(addr1).likeComment(1, 1);
    const comments = await mirrorPost.getComments(1);
    expect(comments[0].likes).to.equal(1);
  });

  it("Should delete a post as moderator", async function () {
    await mirrorPost.createSubCommunity("Tech", "Tech discussions");
    await mirrorPost.createPost(1, "Hello, world!");
    await mirrorPost.deletePost(1);
    const post = await mirrorPost.getPost(1);
    expect(post.isDeleted).to.equal(true);
  });

  it("Should delete a comment as moderator", async function () {
    await mirrorPost.createSubCommunity("Tech", "Tech discussions");
    await mirrorPost.createPost(1, "Hello, world!");
    await mirrorPost.createComment(1, "Great post!");
    await mirrorPost.deleteComment(1, 1);
    const comments = await mirrorPost.getComments(1);
    expect(comments[0].isDeleted).to.equal(true);
  });

  it("Should fail to set duplicate username", async function () {
    await mirrorPost.setUsername("User#1234");
    await expect(
      mirrorPost.connect(addr1).setUsername("User#1234")
    ).to.be.revertedWith("Username already taken");
  });

  it("Should fail to delete post as non-moderator", async function () {
    await mirrorPost.createSubCommunity("Tech", "Tech discussions");
    await mirrorPost.createPost(1, "Hello, world!");
    await expect(
      mirrorPost.connect(addr1).deletePost(1)
    ).to.be.revertedWith("Only sub-community creator can perform this action");
  });
});