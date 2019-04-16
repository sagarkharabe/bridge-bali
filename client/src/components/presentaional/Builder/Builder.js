import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { fetchUser } from "../../../actions/authAction";
import { fetchDrafts } from "../../../actions/userLevelAction";
import LevelThumbnail from "../LevelThumbnail/LevelThumbnail";
import { Link } from "react-router-dom";
class Builder extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  static propTypes = {
    auth: PropTypes.object.isRequired
  };
  componentDidMount() {
    this.props.fetchDrafts();
  }
  goToCreate = () => {};
  render() {
    return (
      <React.Fragment>
        <div>
          Welcome, {this.props.auth.user.name + " "}. You've created
          {this.props.auth.user.createdLevels.length + " "}levels so far.
        </div>

        <header>
          <div style={{ margin: "auto" }}>
            <nav>
              <ul>
                <li>
                  <a href="/createlevel/null">Create new level</a>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <div className="draft-list">
          <h2>Your Drafts</h2>
          <div className="row">
            {this.props.userLevels.drafts.map(draft => (
              <LevelThumbnail
                key={draft._id}
                level={draft}
                edit={true}
                show-creator={true}
              />
            ))}
          </div>
        </div>
        <br />
        <br />
        {/* <div className="saved-list">
          <h2>Your Drafts</h2>
          <div className="row">
            {this.props.userLevels.pubslishedLevels.map(level => (
              <LevelThumbnail
                key={level._id}
                level={level}
                edit={true}
                show-creator={true}
              />
            ))}
          </div>
        </div> */}
      </React.Fragment>
    );
  }
}
const mapStateToProps = ({ auth, userLevels }) => {
  return { auth, userLevels };
};
export default connect(
  mapStateToProps,
  { fetchUser, fetchDrafts }
)(Builder);
