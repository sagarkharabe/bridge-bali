import React, { Component } from "react";
import "./UserMiniCard.css";
export default class UserMiniCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      followed: false
    };
    console.log(this.props);
  }
  render() {
    const { creator, user } = this.props;
    return (
      <div className="minicard pull-right" style={{ marginRight: "20 px" }}>
        <img
          className="profile-pic"
          src="/game/assets/images/gus-static.png"
          id="logo"
          ng-click="checkCreator()"
        />
        <div className="star-count">
          <span className="glyphicon glyphicon-star" /> &#9733;
          {creator.totalStars}
        </div>
        <h3>{creator.name}</h3>
        <p>
          {creator.totalFollowers} follower
          <span ng-show="creator.totalFollowers !== 1">s</span>
        </p>
        {user !== null && user._id !== creator._id ? (
          <div className="controls" ng-if="user!==null&&user._id!==creator._id">
            {!this.state.followed ? (
              <a
                className="btn btn-follow-hollow"
                href="#"
                ng-click="followCreator()"
              >
                <span className="glyphicon glyphicon-user" /> Follow
              </a>
            ) : (
              <a
                className="btn btn-follow"
                href="#"
                ng-show="followed && !pending"
                ng-click="unfollowCreator()"
              >
                <span className="glyphicon glyphicon-user" /> Following
              </a>
            )}
          </div>
        ) : null}

        <div class="more-by" ng-if="user._id!==creator._id">
          <a ng-href="/levels?creator={{creator.name}}">More by this builder</a>
        </div>
      </div>
    );
  }
}
