const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const userDb = require("./../model/user");
const postDb = require("./../model/post");

const register = function(req, res) {
  req.checkBody("name", "Enter a name").exists();
  req
    .checkBody("email", "Invalid Email")
    .exists()
    .isEmail();
  
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }
  
  let user = new userDb();
  user.email = req.body.email.toString().trim();
  user.name = req.body.name.toString();
  
  userDb.findByMail(user.email).exec((err, data) => {
    if(err) throw err;
    else if(data) {
      res.status(400).failure("Email already in use.")
    }else {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(req.body.password.toString(), salt);
      user.password = hash;
      
      let token = jwt.sign(
        {
          email: user.email,
          password: user.password
        },
        "userSecret"
      );
      user.token = token;
      userDb(user).save((err, data) => {
        if(err) throw err;
        else res.status(200).success(user);
      });
    }
  });

  
};

const login = function(req, res) {
  req
    .checkBody("email", "Invalid Email")
    .exists()
    .isEmail();
  req
    .checkBody("password", "Password should be of atleast 8 characters.")
    .exists();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  userDb.findByMail(req.body.email.toString().trim()).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.status(400).failure("There is no account with this email.");
    else {
      if (
        data.password &&
        bcrypt.compareSync(req.body.password.toString().trim(), data.password)
      ) {
        let token = jwt.sign(
          {
            email: data.email,
            password: data.password
          },
          "userSecret"
        );
        userDb.updateToken(data["_id"], token);
        delete data["password"];
        return res.status(200).success(
          {
            token: token,
            info: data
          },
          "User Logged In successfully"
        );
      } else res.status(400).failure("Password is incorrect.");
    }
  });
};

const confirmProfile = function(req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.status(405).failure("No user was found");
    else {
      if (data["password"]) {
        delete data["password"];
        data["password"] = true;
      } else data["password"] = false;
      res.status(200).success(data, "User found");
    }
  });
};

const logout = function(req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.status(405).failure("No user was found");
    else {
      userDb.removeToken(data._id);
      res.success(data, "User logged out successfully.");
    }
  });
};

const post = function(req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();
  req.checkBody("post", "Valid post body is required.")

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.status(405).failure("No user was found");
    else {
      let post = new postDb();
      post.body = req.body.post;
      post.user = data._id;
      post.userName = data.name;
      postDb(post).save((err, postMade) => {
        if(err) throw err;
        else res.status(200).success(postMade, "Post made successfully.")
      })
    }
  });
};

//could be improved with pagination
const fetchPost = function(req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.status(405).failure("No user was found");
    else {
      postDb.find(
          {},
          { 
            "body": 1,
            "user": 1,
            "created": 1,
            "userName": 1,
            "likeCount": 1,
            "likes": {
              "$elemMatch": { "$eq": data._id }
            }
          }
        )
        .sort({$natural:-1})
        .exec((err, posts) => {
          if(err) throw err;
          else res.status(200).success(posts, "Posts you requested for.")
        })
    }
  });
};

const likePost = function (req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();
  req.checkParams("post", "Valid post id is required.")

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.status(405).failure("No user was found");
    else {
      postDb.updateOne(
          { 
            "_id": req.params.post, 
            "likes": { "$ne": data._id }
          },
          {
            "$inc": { "likeCount": 1 },
            "$push": { "likes": data._id }
          }
        ).exec((err, likeData) => {
          if(err) throw err;
          else if(!likeData) res.status(400).failure("Please try again")
          else res.status(200).success({}, "Post liked successfully.")
        })
    }
  });
}

const unLikePost = function (req, res) {
  req.checkHeaders("x-auth-token", "No token was found.").exists();
  req.checkParams("post", "Valid post id is required.")

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).failure("Errors", {
      errors: errors
    });
  }

  let token = req.headers["x-auth-token"];
  userDb.findByToken(token).exec((err, data) => {
    if (err) throw err;
    else if (!data) res.status(405).failure("No user was found");
    else {
      postDb.updateOne(
          { 
            "_id": req.params.post, 
            "likes": data._id
          },
          {
            "$inc": { "likeCount": -1 },
            "$pull": { "likes": data._id }
          }
        ).exec((err, likeData) => {
          if(err) throw err;
          else if(!likeData) res.status(400).failure("Please try again")
          else res.status(200).success({}, "Post unliked successfully.")
        })
    }
  });
}

module.exports = {
  login,
  register,
  confirmProfile,
  logout,
  post,
  fetchPost,
  likePost,
  unLikePost
};
