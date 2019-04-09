import React, { Component } from "react";
import { connect } from "react-redux";
import { login } from "../../../actions/authAction";
import PropTypes from "prop-types";

class Login extends Component {
  static propTypes = {
    login: PropTypes.func.isRequired
  };
  render() {
    return (
      <div>
        <a href="/auth/google" className="btn">
          Google
        </a>
        {/* <button onClick={this.props.login} className="btn">
          Sign In
        </button> */}
      </div>
    );
  }
}
export default connect(
  null,
  { login }
)(Login);
