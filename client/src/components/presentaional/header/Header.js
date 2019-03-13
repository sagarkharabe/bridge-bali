import React, { Component } from "react";
import "./Header.css";
export default class Header extends Component {
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
          <div>
            <p>Welcome, </p>
            <a href="/users/logout">Logout</a>

            <a href="/auth/google">Login with Google</a>
          </div>
        </header>
      </React.Fragment>
    );
  }
}
