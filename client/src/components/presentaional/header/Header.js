import React, { Component } from "react";
import { connect } from "react-redux";
import "./Header.css";
import Login from "../Login/Login";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
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
            <p>Welcome, {this.props.auth.user.name}</p>{" "}
            <a href="/auth/logout">Logout</a>
          </React.Fragment>
        );
    }
  }

  render() {
    return (
      <React.Fragment>
        <header>
          <Link to="/" id="company-title">
            <img src="/game/assets/images/gus-static.png" id="logo" alt="" />
          </Link>
          <div>
            <Link to="/" id="company-title">
              Bridge Bali
            </Link>

            <nav>
              <ul>
                <li>
                  <a href="/levels">Levels</a>
                </li>
                <li>
                  <a href="/">Top Creators</a>
                </li>
                <li>
                  <a href="/stuff">Stuff</a>
                </li>
                <li>
                  <a href="/builder">Builder</a>
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
