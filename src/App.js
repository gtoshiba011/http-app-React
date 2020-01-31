import React, { Component } from "react";
import axios from "axios";
import "./App.css";

const apiEndpoint = "http://jsonplaceholder.typicode.com/posts";
axios.interceptors.response.use(null, error => {
  console.log("INTERCEPTORS CALLED");
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  // handling unexpected errors globally
  if (!expectedError) {
    console.log("Logging the errors", error);
    alert("An unexpected error occurred.");
  }
  return Promise.reject(error);
});

class App extends Component {
  state = {
    posts: []
  };

  async componentDidMount() {
    // axios.get() return a promise, a object to hold the result of async operation
    // pending > resolved (success) OR rejected (failure)
    const { data } = await axios.get(apiEndpoint);
    this.setState({ posts: data });
  }

  handleAdd = async () => {
    const obj = { title: "new object", body: "new body" };
    const { data: post } = await axios.post(apiEndpoint, obj);
    const posts = [post, ...this.state.posts];
    this.setState({ posts });
  };

  handleUpdate = async post => {
    post.title = "updated title";
    post.body = "updated body";
    // patch: update one property
    // put: update all properties
    await axios.put(apiEndpoint + "/" + post.id, post);
    // axios.patch(apiEndpoint + "/" + post.id, { title: post.title });

    const posts = [...this.state.posts];
    const index = posts.indexOf(post);
    posts[index] = { ...post };
    this.setState({ posts });
  };

  handleDelete = async post => {
    const oriPosts = this.state.posts;
    const posts = this.state.posts.filter(p => p.id !== post.id);
    this.setState({ posts });

    try {
      await axios.delete(apiEndpoint + "/" + post.id);
      // trigger expected error
      // await axios.delete(apiEndpoint + "/999");
      // trigger unexpected error
      await axios.delete("s" + apiEndpoint + "/" + post.id);
    } catch (ex) {
      // ex.response
      // 1. null -> no response from the server, the action did not complete
      // 2. not null -> get the response from the server, the action complete
      console.log("HANDLE DELETE CATCH BLOCK");
      // Expected errors
      if (ex.response && ex.response.status === 404) {
        alert("An unexpected error occurred. This post has been deleted.");
      }
      this.setState({ posts: oriPosts });
    }
  };

  render() {
    return (
      <React.Fragment>
        <button className="btn btn-primary" onClick={this.handleAdd}>
          Add
        </button>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {this.state.posts.map(post => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => this.handleUpdate(post)}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => this.handleDelete(post)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

export default App;
