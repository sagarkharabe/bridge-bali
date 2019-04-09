import React, { Component } from "react";
import { connect } from "react-redux";
import "./Header.css";
import Login from "../Login/Login";
import PropTypes from "prop-types";

class Header extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired
  };
  componentDidMount() {
    console.log(this.props);
  }
  renderContent() {
    switch (this.props.auth.isAuthenticated) {
      case null:
        return;
      case false:
        return <Login />;
      default:
        return (
          <React.Fragment>
            <p>Welcome, </p> <a href="/auth/logout">Logout</a>
          </React.Fragment>
        );
    }
  }

  render() {
    return (
      <React.Fragment>
        <header>
          <a href="/" id="company-title">
            <img src="/game/assets/images/gus-static.png" id="logo" alt="" />
          </a>
          <div>
            <a href="/" id="company-title">
              Bridge Bali
            </a>

            <nav>
              <ul>
                <li>
                  <a href="/">Levels</a>
                </li>
                <li>
                  <a href="/">Top Creators</a>
                </li>
                <li>
                  <a href="/">Stuff</a>
                </li>
                <li>
                  <a href="/">Builder</a>
                </li>
              </ul>
            </nav>
          </div>
          <div>{this.renderContent()}</div>
        </header>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ auth }) => {
  return { auth };
};
export default connect(
  mapStateToProps,
  null
)(Header);
