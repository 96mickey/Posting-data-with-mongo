import React, { Component } from "react";
import "../../../node_modules/font-awesome/css/font-awesome.min.css";
import Notification from "react-bulma-notification";
import "./profile.css";
import Posts from '../posts/Posts.js'
import { PostData, GetData, DeleteData } from "../../helpers/apicall";
import Loader from "../loader/Loader";


class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: "",
      posts: [],
      loaded: false
    };
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  
  makeAPost = () => {
    //api call to save the post in your name
    PostData("post", this.state)
      .then(result => {
        if (result.status === "failure") {
          //shift the data
          Notification.error(result.message);
        } else {
          let posts = this.state.posts
          posts.unshift(result.data)
          this.setState({ posts, post: "" })
          Notification.success(result.message);
        }
      })
      .catch(error => {
        //shift the post
        Notification.error("Error! Please try again.");
      });
  }
  
  like = (id) => {
    PostData(`like/${id}`)
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          let posts = this.state.posts;
          let index = posts.findIndex(item => item._id === id);
          posts[index].likeCount += 1;
          posts[index].likes.push("one like.")
          this.setState({posts})
        }
      })
      .catch(error => {
        //shift the post
        Notification.error("Error! Please try again.");
      });
  }
  
  unLike = (id) => {
    DeleteData(`like/${id}`)
      .then(result => {
        if (result.status === "failure") {
          Notification.error(result.message);
        } else {
          let posts = this.state.posts;
          let index = posts.findIndex(item => item._id === id);
          posts[index].likeCount -= 1;
          posts[index].likes.pop()
          this.setState({posts})
        }
      })
      .catch(error => {
        Notification.error("Error! Please try again.");
      });
  }
  
  componentDidMount = () => {
    GetData("post")
        .then(result => {
          if (result.status === "failure") {
            Notification.error(result.message);
          } else {
            this.setState({ loaded: true, posts: result.data });
          }
        })
        .catch(err => console.log(err));
  }

  render() {
    let { loaded, posts } = this.state
      return (
        <div className="wrapper-main-post">
        <div className="main-profile-wrapper">
          
            {this.props.profileData.name &&
            this.props.profileData.name !== "" ? (
            <div className="profile-page-wrapper">
              <div className="profile-item">
                <div>Greetings <span><strong>{this.props.profileData.name}</strong></span>
              </div> 
              </div>
              <div className="profile-item">
                <button onClick={this.props.logout}>Logout</button>
              </div>
              </div>
            ) : (
              ""
            )}
            
            <div className="text-area-wrapper">
              <label htmlFor="story">Tell us your story:</label>
              
              <textarea 
              id="story" 
              name="post"
              rows="5"
              value={this.state.post}
              onChange={this.handleChange} />
            </div>
            <button onClick={this.makeAPost} className="profile-item">Submit</button>
            
            <div className="post-wrapper">
            {loaded ? <Posts posts={posts} like={(id) => this.like(id)} unLike={(id) => this.unLike(id)} /> : <center><Loader /></center>}
            </div>
        </div>
        </div>
      );
  }
}

export default ProfilePage;
