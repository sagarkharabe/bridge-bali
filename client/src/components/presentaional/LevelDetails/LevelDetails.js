import "./LevelDetails.css";
import GameView from "../../container/game-view/GameView";
import React, { Component } from "react";
import Axios from "axios";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { fetchLevelById } from "../../../actions/levelAction";
import { levelLiker } from "../../../actions/socialAction";
import UserMiniCard from "../../container/UserMiniCard/UserMiniCard";
class LevelDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      level: {
        levelId: this.props.match.params.levelId,
        dateCreated: null,
        starCount: null,
        title: null,
        creator: null
      },
      liked: false,
      pending: false
    };

    this.eventEmitter = window.eventEmitter;
    this.eventEmitter.only("what level to play", data => {
      var whatToPlay = ["notFound"];
      if (this.state.level.levelId)
        whatToPlay = ["levelId", this.state.level.levelId];
      this.eventEmitter.emit("play this level", whatToPlay);
    });
    this.eventEmitter.only("submit win play data", playData => {
      if (!this.props.auth.isAuthenticated)
        return console.log(
          "Player is not Logged in. Stats will not be saved.",
          playData
        );
      console.log("User logged IN  saving playdata ", playData);
      playData.level = this.state.level.levelId;
      // return Axios.post().then(data => console.log("Stats Saved ",data))
    });
  }

  async componentDidMount() {
    await this.props.fetchLevelById(this.state.level.levelId);
    await this.setState({
      ...this.state,
      level: {
        levelId: this.props.level.levelId,
        dateCreated: this.props.level.dateCreated,
        starCount: this.props.level.starCount,
        title: this.props.level.title,
        creator: this.props.level.creator
      },
      liked: this.checkLikedLevel()
    });
    console.log("this. state ", this.state);
  }
  checkLikedLevel = () => {
    if (this.props.auth.user) {
      console.log(
        "liked",
        this.props.auth.user.likedLevels.indexOf(this.props.level.levelId)
      );
      return (
        this.props.auth.user.likedLevels.indexOf(this.props.level.levelId) !==
        -1
      );
    } else return false;
  };
  serverStarToggle = action => {
    this.props.levelLiker(this.state.level.levelId, action);
  };
  starLevel = () => {
    this.setState(
      {
        level: {
          ...this.state.level,
          starCount: this.state.level.starCount + 1,
          creator: {
            ...this.state.level.creator,
            totalStars: this.state.level.creator.totalStars + 1
          }
        },
        liked: true
      },
      () => console.log("this state star level ", this.state)
    );
    this.serverStarToggle("likeLevel");
  };

  unstarLevel = () => {
    this.setState(
      {
        level: {
          ...this.state.level,
          starCount: this.state.level.starCount - 1,
          creator: {
            ...this.state.level.creator,
            totalStars: this.state.level.creator.totalStars - 1
          }
        },
        liked: false
      },
      () => console.log("this state unstar level ", this.state)
    );
    this.serverStarToggle("unlikeLevel");
  };
  render() {
    const { user } = this.props.auth;
    const { creator } = this.props.level;
    const { liked, pending } = this.state;
    return (
      <React.Fragment>
        <div id="level-header">
          <h1>{this.props.level.title}</h1>
          {/* <div share-square="true" share-links="Facebook" share-title="Article Title" id='fblink'></div> */}
        </div>
        <GameView />
        {creator !== null ? (
          <UserMiniCard user={user} creator={creator} />
        ) : null}
        <div id="level-metadata">
          <div className="metadata">
            <p>
              <span className="label">Total Stars:</span> 5
            </p>
            <p>
              <span className="label">Date Created:</span> 5 march
            </p>
          </div>
          {this.props.level.levelLoaded &&
          user !== null &&
          user._id !== creator._id ? (
            <div className="controls" id="starring">
              {!liked && !pending ? (
                <a
                  className="btn btn-star-hollow"
                  href="#"
                  onClick={this.starLevel}
                >
                  <span className="glyphicon glyphicon-star-empty" /> &#9733;
                  STAR
                </a>
              ) : null}
              {!liked && pending ? (
                <a className="btn btn-disabled">
                  <span className="glyphicon glyphicon-time" />
                  &#9733; STAR
                </a>
              ) : null}
              {liked && !pending ? (
                <a className="btn btn-star" href="#" onClick={this.unstarLevel}>
                  <span className="glyphicon glyphicon-star" />
                  &#9733; STARRED
                </a>
              ) : null}
              {liked && pending ? (
                <a className="btn btn-disabled">
                  <span className="glyphicon glyphicon-time" />
                  &#9733; STARRED
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="controls" id="fork">
            <a
              className="btn btn-create"
              href={"/createlevel/" + this.state.level.levelId}
            >
              New From Level
            </a>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
LevelDetails.propTypes = {
  auth: PropTypes.object.isRequired
};
const mapStateToProps = ({ auth, level }) => {
  return { auth, level };
};
export default connect(
  mapStateToProps,
  { fetchLevelById, levelLiker }
)(LevelDetails);
// /level/5cb59fea888a281ab9e7ff35
