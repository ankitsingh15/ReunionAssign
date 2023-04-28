const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index.js");
const User = require("../models/User.js");
const Post = require("../models/Post.js");
const Comment = require("../models/Comment.js");
console.log("App is", app); // assuming the application's server instance is exported from the 'app.js' file
const expect = chai.expect;

chai.use(chaiHttp);

describe("addPosts API endpoint", () => {
  it("should create a new post", (done) => {
    chai
      .request(app)
      .post("/api/posts")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDRhODViYTgzNzU5MzIwYTAzMTE1NDEiLCJpYXQiOjE2ODI2MjI4NDEsImV4cCI6MTY4MjcwOTI0MX0.41z84jJvQ0C32qf0f7H3sV1cIqULVyNP8CxfO_zKjD8"
      )
      .send({
        title: "Test post",
        description: "This is a test post",
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("postId");
        expect(res.body).to.have.property("title", "Test post");
        expect(res.body).to.have.property("description", "This is a test post");
        expect(res.body).to.have.property("CreatedTime");
        done();
      });
  });

  it("should create a new post", async () => {
    // Arrange
    const user = {
      _id: "611fbea52a9177001576988d",
    };
    const post = {
      title: "Test post",
    };

    // Act

    const res = await chai
      .request(app)
      .post("/api/posts")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDRhODViYTgzNzU5MzIwYTAzMTE1NDEiLCJpYXQiOjE2ODI2MjI4NDEsImV4cCI6MTY4MjcwOTI0MX0.41z84jJvQ0C32qf0f7H3sV1cIqULVyNP8CxfO_zKjD8"
      )
      .send({ ...post });

    // Assert
    expect(res).to.have.status(200);
    expect(res.body.error).to.equal("Title and Description are Required");
  });

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
