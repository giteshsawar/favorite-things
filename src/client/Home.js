/* eslint-disable react/sort-comp */
import React, { Component } from 'react';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authForm: 'signup',
      email: '',
      username: '',
      password: '',
      name: '',
      error: '',
      user: {},
      loading: true,
      changes: [],
      newFav: {
        title: '',
        Description: '',
        metadata: '',
        category: '',
      }
    };
    this.checkUserAuthStatus();
  }

  resetState = () => ({
    authForm: 'signup',
    email: '',
    username: '',
    password: '',
    name: '',
    error: '',
    user: {},
    loading: false,
    changes: [],
    newFav: {
      title: '',
      Description: '',
      metadata: '',
      category: '',
    }
  });

  checkUserAuthStatus = () => {
    fetch('/auth/checkAuth')
      .then(res => res.json())
      .then(
        (result) => {
          console.log('is user authenticated', result);
          if (result.user) {
            this.setState({
              user: result.user || {},
              loading: false,
            });
          } else {
            this.setState({ loading: false });
          }
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log('is user authenticated error', error);
          this.setState({
            error,
            loading: false,
          });
        }
      );
  };

  getUserAuthenticated = (data, state) => {
    const path = state === 'signup' ? '/auth/signup' : '/auth/login';
    console.log('send request data', data);
    fetch(path, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(
        (result) => {
          console.log('add result afte suth sucess', result);
          if (result.user) {
            this.setState({
              user: result.user,
              loading: false,
            });
          } else {
            this.setState({ error: result.message, loading: false });
          }
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log('error authenticating user', error);
          this.setState({
            error: 'Error authenticating user',
            loading: false,
          });
        }
      );
  };

  handleAuth = () => {
    this.setState({ loading: true }, () => {
      const {
        authForm, email, username, password, name, error
      } = this.state;
      let errorMsg = '';
      const data = {};
      if (authForm === 'login') {
        data.username = username;
        data.password = password;
      } else {
        data.name = name;
        data.username = username;
        data.password = password;
        data.email = email;
      }

      console.log('check user data', data);
      Object.keys(data).forEach((key) => {
        console.log('user data key', key, data[key]);
        if (data[key].length === 0) {
          errorMsg = 'Please fill the complete form.';
        }
      });

      if (errorMsg.length === 0) {
        this.getUserAuthenticated(data, authForm);
      } else {
        this.setState({ loading: false, error: errorMsg });
      }
    });
  };

  getInputValue = (e, key) => {
    const data = {};
    data[key] = e.target.value;
    data.error = '';
    this.setState(data, () => {
      console.log('input value updated', this.state);
    });
  }

  renderActiveForm = () => {
    const {
      authForm, email, username, password, name
    } = this.state;
    if (authForm === 'login') {
      return (
        <div className="login-form">
          <input type="text" value={username} placeholder="Enter your username" onChange={e => this.getInputValue(e, 'username')} />
          <input type="text" value={password} placeholder="Enter your password" onChange={e => this.getInputValue(e, 'password')} />
          <div className="button">
            <button className="submit" onClick={this.handleAuth}>Submit</button>
          </div>
        </div>
      );
    }
    return (
      <div className="signup-form">
        <input type="text" value={name} placeholder="Enter your name" onChange={e => this.getInputValue(e, 'name')} />
        <input type="text" value={username} placeholder="Enter your username" onChange={e => this.getInputValue(e, 'username')} />
        <input type="text" value={email} placeholder="Enter your email" onChange={e => this.getInputValue(e, 'email')} />
        <input type="text" value={password} placeholder="Enter your password" onChange={e => this.getInputValue(e, 'password')} />
        <div className="button">
          <button className="submit" onClick={this.handleAuth}>Submit</button>
        </div>
      </div>
    );
  }

  renderAuthForm = () => {
    const { authForm } = this.state;
    return (
      <div className="form">
        <div className="switch">
          <button className={`radio ${authForm === 'signup' ? 'active' : ''}`} onClick={() => this.setActiveForm('signup')}>Signup</button>
          <button className={`radio ${authForm === 'login' ? 'active' : ''}`} onClick={() => this.setActiveForm('login')}>Login</button>
        </div>
        {this.renderActiveForm()}
      </div>
    );
  }

  moveFavouriteItem = (id, move) => {
    const { user, changes } = this.state;
    const f = user.favourites.findIndex(favourite => favourite._id === id);
    if (f >= 0) {
      const newPosition = f + move;
      if (newPosition <= user.favourites.length - 1 && newPosition >= 0) {
        user.favourites.splice(f + move, 0, user.favourites.splice(f, 1)[0]);
        console.log('move user fav', user.favourites);
        const change = changes.find(c => c.id === id);
        if (change) {
          change.newPosition = newPosition;
        } else {
          const newChange = {
            id,
            newPosition,
            title: user.favourites[newPosition].title
          };
          changes.push(newChange);
        }
        this.setState({ user, changes, error: '' }, () => {
          console.log('user favourite updated', user.favourites, changes);
        });
      } else {
        console.log('Invalid move');
      }
    }
  }

  updateList = () => {
    const { changes, user } = this.state;
    this.setState({ loading: true, user: {} }, () => {
      fetch('/favourites/updateFavouritesRank', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ list: user.favourites, changes }),
      })
        .then(res => res.json())
        .then(
          (result) => {
            console.log('user list updated', result);
            if (result.user) {
              this.setState({
                user: result.user || {},
                loading: false,
              });
            } else {
              this.setState({ error: result.error, loading: false });
            }
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            console.log('user list updated error', error);
            this.setState({
              error,
              loading: false,
            });
          }
        );
    });
  }

  addNewFavouriteItem = () => {
    const { newFav } = this.state;
    let isAllowed = true;

    Object.keys(newFav).forEach((key) => {
      if (newFav[key].length === 0) {
        console.log('fav keuy empty', newFav[key], key);
        isAllowed = false;
      }
    });

    if (isAllowed) {
      this.setState({ loading: true }, () => {
        fetch('/favourites/createNewFavourite', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post: newFav }),
        })
          .then(res => res.json())
          .then(
            (result) => {
              console.log('add new favourite', result);
              if (result.user) {
                const favourite = {
                  title: '',
                  Description: '',
                  metadata: '',
                  category: '',
                };
                this.setState({
                  user: result.user || {},
                  newFav: favourite,
                  loading: false,
                });
              } else {
                this.setState({ error: result.error, loading: false });
              }
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
              console.log('add new favourite error', error);
              this.setState({
                error,
                loading: false,
              });
            }
          );
      });
    } else {
      this.setState({ error: 'Fill all details of new favourite item' });
    }
  }

  getFavValue = (e, key) => {
    const { newFav } = this.state;
    newFav[key] = e.target.value;
    this.setState({ newFav });
  };

  logOut = () => {
    const state = this.resetState();
    this.setState({ loading: true }, () => {
      fetch('/auth/logout')
        .then(res => res.json())
        .then(
          (result) => {
            console.log('add result after logout', result);
            this.setState(state);
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            console.log('error logging out', error);
            this.setState(state);
          }
        );
    });
  }

  renderUserDetails = () => {
    const { user, newFav } = this.state;
    return (
      <div className="user">
        <div className="logout">
          <button className="radio active" onClick={this.logOut}>Logout</button>
        </div>
        <div className="user-info">
          <h3>
            Name:
            {' '}
            {user.name}
          </h3>
          <h3>
            Email:
            {' '}
            {user.email}
          </h3>
        </div>
        <div className="favourites">
          <h2>Favourite List</h2>
          {user.favourites && user.favourites.length > 0 ? (
            <React.Fragment>
              {user.favourites.map((item, index) => (
                <div className="fav-item">
                  <div className="move-btns">
                    {index > 0 && <button className="up" onClick={() => this.moveFavouriteItem(item._id, -1)}>move up</button>}
                    {index < user.favourites.length - 1 && <button className="down" onClick={() => this.moveFavouriteItem(item._id, 1)}>move down</button>}
                  </div>
                  <div className="item-info">
                    <p><b>Category: </b>{item.category}</p>
                    <p><b>Title:</b> {item.title}</p>
                    <p><b>Description: </b>{item.Description}</p>
                    <p><b>Metadata: </b>{item.metadata}</p>
                  </div>
                </div>
              ))}
              <div>
                <button className="submit" onClick={this.updateList}>Update</button>
              </div>
            </React.Fragment>
          ) : null}
        </div>
        {user.auditLogs ? (
          <div className="logs">
              <h2>Activity Logs</h2>
              <ol>
                {user.auditLogs.list.map(item => (
                  <li>{item}</li>
                ))}
              </ol>
            </div>
        ) : null}
        <div className="add-favourite">
          <h2>Add new favourite</h2>
          <input type="text" value={newFav.title} placeholder="Enter favourite title" onChange={e => this.getFavValue(e, 'title')} />
          <input type="text" value={newFav.Description} placeholder="Enter favourite description" onChange={e => this.getFavValue(e, 'Description')} />
          <input type="text" value={newFav.metadata} placeholder="Enter favourite metadata" onChange={e => this.getFavValue(e, 'metadata')} />
          <input type="text" value={newFav.category} placeholder="Enter favourite category" onChange={e => this.getFavValue(e, 'category')} />
          <button className="submit" onClick={this.addNewFavouriteItem}>Submit</button>
        </div>
      </div>
    );
  };

  setActiveForm = (authForm) => {
    this.setState({ authForm });
  };

  componentDidMount() {
  }

  render() {
    const {
 authForm, user, loading, error 
} = this.state;
    return (
      <div>
        {loading ? (<h2>Loading....</h2>) : (
          <React.Fragment>
            {error.length > 0 && <div className="error">{error}</div>}
            {user._id ? this.renderUserDetails() : this.renderAuthForm()}
          </React.Fragment>
        )}
      </div>
    );
  }
}
