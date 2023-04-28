const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responsiveWrapper");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { post } = require("../routers/authRouter");

const loginController = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.send(error(400, "All fields are required"));
    }

    const userfromdb = await User.findOne({ email: email });
    // console.log("userfromdb", userfromdb);
    if (userfromdb) {
      const pass = userfromdb.password;
      const checkpass = await bcrypt.compare(password, pass);
      if (checkpass) {
        const accessToken = generateAccessToken({ _id: userfromdb._id });

        return res.send({ token: accessToken });
      } else {
        res.send(error(403, "Password Not match"));
      }
    }

    const pass = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: pass,
    });

    const accessToken = generateAccessToken({ _id: user._id });

    return res.send(success(201, { accessToken }));
  } catch (e) {
    console.log(e);
    rres.send({ error: e.message });
  }
};

//Internal Function for creating Token
const generateAccessToken = (data) => {
  const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
    expiresIn: "1d",
  });
  // console.log(token);
  return token;
};

const followuser = async (req, res) => {
  try {
    const userId = req._id;
    const userIdtoFollow = req.params.id;

    const curuser = await User.findById(userId);
    const userToFollow = await User.findById(userIdtoFollow);
    // console.log("user are", curuser, userToFollow);
    if (curuser.followings.includes(userIdtoFollow)) {
      return res.send({ message: "You're already following the User" });
    } else {
      curuser.followings.push(userIdtoFollow);
      userToFollow.followers.push(userId);
      await curuser.save();
      await userToFollow.save();
      return res.send({ message: "User Unfollowed" });
    }
  } catch (e) {
    console.log(e.message);
    res.send({ error: e.message });
  }
};

const Unfollowuser = async (req, res) => {
  try {
    const userId = req._id;
    const userIdToUnfollow = req.params.id;
    const currUser = await User.findById(userId);
    const userToUnFollow = await User.findById(userIdToUnfollow);

    if (!currUser.followings.includes(userIdToUnfollow)) {
      return res.send(error(409, "You don't follow This User"));
    } else {
      const followingIndex = currUser.followings.indexOf(userIdToUnfollow);
      const followersIndex = userToUnFollow.followers.indexOf(userId);
      currUser.followings.splice(followingIndex, 1);
      userToUnFollow.followers.splice(followersIndex, 1);
      await currUser.save();
      await userToUnFollow.save();

      return res.send({ message: "Sucessfully Unfollowed" });
    }
  } catch (e) {
    res.send({ error: e.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    if (!req._id) {
      return res.send({ error: "You are not Authorized" });
    }
    const userId = req._id;
    const user = await User.findById(userId);
    const { username, followers, followings } = user;
    console.log(username, followers, followings);
    return res.send({
      username,
      Followers: followers.length,
      Followings: followings.length,
    });
  } catch (e) {
    return res.send({ error: e.message });
  }
};

const addPosts = async (req, res) => {
  try {
    const userId = req._id;
    const { title, description } = req.body;
    if (!title || !description) {
      return res.send({ error: "Title and Description are Required" });
    }
    const post = await Post.create({
      owner: userId,
      title,
      description,
    });
    const userfromDb = await User.findById(userId);
    // console.log("Posts is ", post);
    userfromDb.posts.push(post._id);
    await userfromDb.save();
    return res.send({
      postId: post._id,
      title: post.title,
      description: post.description,
      CreatedTime: post.createdAt,
    });
  } catch (e) {
    return res.send({ error: e.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req._id;
    const user = await User.findById(userId);
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.send({ error: "Post not found to be Deleted" });
    }
    console.log("post ids", userId, postExists.owner);
    if (postExists.owner.equals(userId)) {
      const index = user.posts.indexOf(postId);
      user.posts.splice(index, 1);
      await user.save();
      await Post.findOneAndDelete(postId);
      return res.send(success(201, "Post Deleted Succesfully"));
    } else {
      return res.send(error(400, "You cannot delete Others Post"));
    }
  } catch (e) {
    res.send({ error: e.message });
  }
};

const likePost = async (req, res) => {
  try {
    console.log("Hiii");
    const userId = req._id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (post.likes.includes(userId)) {
      return res.send(success(201, "You've already liked this post"));
    }
    post.likes.push(userId);
    await post.save();
    return res.send(success(201, "Post Liked Successfully"));
  } catch (e) {
    // console.log(e.message);
    res.send({ error: e.message });
  }
};

const unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req._id;
    const post = await Post.findById(postId);
    // console.log("ids are", userId, post.likes);
    if (post.likes.includes(userId)) {
      const index = post.likes.indexOf(userId);
      post.likes.splice(index, 1);
      await post.save();
      return res.send(success(201, "Post Unliked Successfully"));
    } else {
      return res.send(error(401, "You Don't like this Post"));
    }
  } catch (e) {
    // console.log(e.message);
    res.send({ error: e.message });
  }
};

const addComment = async (req, res) => {
  try {
    const userId = req._id;
    const postId = req.params.id;
    const desc = req.body.desc;
    const post = await Post.findById(postId);
    if (!post) {
      return res.send(error(409, "Post not found"));
    }
    // console.log("post is", post);
    if (!desc) {
      return res.send(error(409, "Desc is required"));
    }
    const dbacomment = await Comment.create({
      userId,
      postId,
      desc,
    });
    post.comment.push(dbacomment._id);
    await post.save();
    return res.send({ id: dbacomment._id });
  } catch (e) {
    // console.log(e.message);
    res.send({ error: e.message });
  }
};

const getPostWithId = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId).populate("comment");
    console.log("The posts are ", post, req.params.id);
    if (!post) {
      return res.send(error(407, "No Post Found!! "));
    }

    return res.send({
      postId,
      likes: post.likes.length,
      comment: post.comment.length,
    });
  } catch (e) {
    // console.log(e.message);
    res.send({ error: e.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const userId = req._id;

    const posts = await Post.find({ owner: userId })
      .sort({ createdAt: "desc" })
      .populate("comment");

    const mappedPosts = posts.map((post) => ({
      id: post._id,
      title: post.title,
      desc: post.desc,
      created_at: post.createdAt,
      comments: post.comment.map((comm) => {
        return comm.desc;
      }),
      likes: post.likes.length,
    }));

    // console.log(mappedPosts);

    res.send(success(200, mappedPosts));
  } catch (e) {
    // console.log(e.message);
    res.send({ error: e.message });
  }
};

module.exports = {
  loginController,

  followuser,
  Unfollowuser,
  addPosts,
  getUserProfile,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getPostWithId,
  getAllPosts,
};
