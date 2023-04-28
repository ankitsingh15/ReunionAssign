const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index.js");
const User = require("../models/User.js");
const Post = require("../models/Post.js");
const Comment = require("../models/Comment.js");
console.log("App is", app); // assuming the application's server instance is exported from the 'app.js' file
const expect = chai.expect;

describe("addPosts API endpoint", () => {
  it("should return user profile data", async () => {
    // create a test user
    const testUser = {
      username: "testuser",
      email: "testuser@example.com",
      password: "testpassword",
    };
    const userResponse = await chai.request(app).post("/users").send(testUser);
    const userId = userResponse.body.id;

    // login the test user
    const loginResponse = await chai
      .request(app)
      .post("/api/authenticate")
      .send({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      });
    const token = loginResponse.body.token;

    // make request to getUserProfile endpoint
    const response = await chai
      .request(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(response).to.have.status(200);
    expect(response.body.username).to.equal(testUser.username);
    expect(response.body.Followers).to.equal(0);
    expect(response.body.Followings).to.equal(0);

    // cleanup - delete the test user and associated data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Post.deleteMany({ owner: userId }),
      Comment.deleteMany({ userId: userId }),
    ]);
  });
});
