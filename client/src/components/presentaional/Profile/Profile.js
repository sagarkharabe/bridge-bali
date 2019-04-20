import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import LevelThumbnail from "../LevelThumbnail/LevelThumbnail";
import Axios from "axios";
import {
  fetchOwnProfile,
  fetchProfileLevels
} from "../../../actions/usersAction";
class Profile extends Component {
  state = {
    createdLevels: null,
    currentPage: {
      createdLevels: 1,
      draftLevels: 1
    },
    pages: {
      createdLevels: null,
      draftLevels: null
    },
    createdLevelsRows: null,
    draftLevelsRows: null
  };
  rowSize = 4;
  makeRows = levels => {
    return levels.reduce(
      (levelMap, level) => {
        if (levelMap[levelMap.length - 1].length < this.rowSize) {
          levelMap[levelMap.length - 1].push(level);
        } else {
          levelMap.push([level]);
        }
        return levelMap;
      },
      [[]]
    );
  };

  makePages = count => {
    var arr = [];
    for (var i = 1; i <= count; i++) {
      arr.push(i);
    }
    return arr;
  };

  static propTypes = {
    auth: PropTypes.object.isRequired,
    fetchOwnProfile: PropTypes.func.isRequired,
    profile: PropTypes.object.isRequired
  };
  async componentDidMount() {
    await this.props.fetchOwnProfile();
    await this.props.fetchProfileLevels("created", 1);
    await this.props.fetchProfileLevels("drafts", 1);
    await this.props.fetchProfileLevels("liked", 1);
    const { profile } = this.props;

    await this.setState({
      createdLevelsRows: this.makeRows(profile.createdLevels.levels),
      draftLevelsRows: this.makeRows(profile.draftLevels.levels),
      likedLevelsRows: this.makeRows(profile.likedLevels.levels),
      pages: {
        createdLevels: this.makePages(profile.createdLevels.pages),
        draftLevels: this.makePages(profile.draftLevels.pages),
        likedLevels: this.makePages(profile.likedLevels.pages)
      }
    });
  }

  loadCreatedPages = async page => {
    await this.props.fetchProfileLevels("created", page);
    console.log("Loading created pages");
    const { profile } = this.props.profile;
    this.setState(() => ({
      createdLevelsRows: this.makeRows(profile.createdLevels.levels),
      currentPage: {
        createdLevels: page
      },
      pages: {
        createdLevels: this.makePages(profile.createdLevels.pages)
      }
    }));
  };
  loadDraftPages = async page => {
    await this.props.fetchProfileLevels("drafts", page);
    console.log("Loading draft pages");
    const { profile } = this.props.profile;
    this.setState(() => ({
      draftLevelsRows: this.makeRows(profile.draftLevels.levels),
      currentPage: {
        draftLevels: page
      },
      pages: {
        draftLevels: this.makePages(profile.draftLevels.pages)
      }
    }));
  };
  loadLikedPages = async page => {
    await this.props.fetchProfileLevels("liked", page);
    console.log("Loading liked pages");
    const { profile } = this.props.profile;
    this.setState(() => ({
      likedLevelsRows: this.makeRows(profile.likedLevels.levels),
      currentPage: {
        likedLevels: page
      },
      pages: {
        likedLevels: this.makePages(profile.likedLevels.pages)
      }
    }));
  };

  deleteLevel = async id => {
    // await this.props.deleteLevel(id)
    // this.loadCreatedPages()
  };
  render() {
    const { user } = this.props.auth;
    return (
      <div>
        <div id="profile-user-info">
          <h2>{user.name}</h2>
          <h5>{user.email}</h5>
        </div>
        <div className="profile-levels-list" id="created-levels">
          <h4>Levels You've Created</h4>
          <div className="levels-list">
            <div className="row">
              {this.state.createdLevelsRows
                ? this.state.createdLevelsRows.map(levelrow =>
                    levelrow.map(level => (
                      <LevelThumbnail
                        key={level._id}
                        level={level}
                        edit={true}
                        show-creator={true}
                      />
                    ))
                  )
                : null}
            </div>
          </div>
          <nav className="text-center">
            <ul className="pagination">
              {this.state.currentPage.createdLevels !== 1 ? (
                <li>
                  <a
                    onClick={() =>
                      this.loadCreatedPages(
                        this.state.currentPage.createdLevels - 1
                      )
                    }
                  >
                    <h3>« Prev </h3>
                  </a>
                </li>
              ) : (
                <li>
                  <a className="disabled">
                    <h3>« Prev </h3>
                  </a>
                </li>
              )}
              {this.state.createdLevelsRows &&
                this.state.pages.createdLevels.map(page => (
                  <li
                    key={page}
                    className={
                      page == this.state.currentPage.createdLevels
                        ? "active"
                        : ""
                    }
                  >
                    <a
                      className={
                        page == this.state.currentPage.createdLevels
                          ? "disabled"
                          : ""
                      }
                      onClick={() => this.loadCreatedPages(page)}
                    >
                      <h3>{page}</h3>
                    </a>
                  </li>
                ))}
              {this.state.createdLevelsRows &&
              this.state.currentPage.createdLevels !==
                this.state.pages.createdLevels.length ? (
                <li>
                  <a
                    onClick={() =>
                      this.loadCreatedPages(
                        this.state.currentPage.createdLevels + 1
                      )
                    }
                  >
                    <h3>Next »</h3>
                  </a>
                </li>
              ) : (
                <li>
                  <a className="disabled">
                    <h3>Next »</h3>
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
        <br /> <br />
        <div className="profile-level-list" id="draft-levels">
          <h4 id="created-levels">Drafts You're Working On</h4>
          <div className="levels-list">
            <div className="row">
              {this.state.draftLevelsRows
                ? this.state.draftLevelsRows.map(levelrow =>
                    levelrow.map(level => (
                      <LevelThumbnail
                        key={level._id}
                        level={level}
                        edit={true}
                        show-creator={true}
                      />
                    ))
                  )
                : null}
            </div>
          </div>
          <nav className="text-center">
            <ul className="pagination">
              {this.state.currentPage.draftLevels !== 1 ? (
                <li>
                  <a
                    onClick={() =>
                      this.loadCreatedPages(
                        this.state.currentPage.draftLevels - 1
                      )
                    }
                  >
                    <h3>« Prev </h3>
                  </a>
                </li>
              ) : (
                <li>
                  <a className="disabled">
                    <h3>« Prev </h3>
                  </a>
                </li>
              )}
              {this.state.draftLevelsRows &&
                this.state.pages.draftLevels.map(page => (
                  <li
                    key={page}
                    className={
                      page == this.state.currentPage.draftLevels ? "active" : ""
                    }
                  >
                    <a
                      className={
                        page == this.state.currentPage.draftLevels
                          ? "disabled"
                          : ""
                      }
                      onClick={() => this.loadCreatedPages(page)}
                    >
                      <h3>{page}</h3>
                    </a>
                  </li>
                ))}
              {this.state.draftLevelsRows &&
              this.state.currentPage.draftLevels !==
                this.state.pages.draftLevels.length ? (
                <li>
                  <a
                    onClick={() =>
                      this.loadCreatedPages(
                        this.state.currentPage.draftLevels + 1
                      )
                    }
                  >
                    <h3>Next »</h3>
                  </a>
                </li>
              ) : (
                <li>
                  <a className="disabled">
                    <h3>Next »</h3>
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
        <br /> <br />
        <div className="profile-level-list" id="liked-levels">
          <h4 id="created-levels">Levels You've Starred..</h4>
          <div className="levels-list">
            <div className="row">
              {this.state.likedLevelsRows
                ? this.state.likedLevelsRows.map(levelrow =>
                    levelrow.map(level => (
                      <LevelThumbnail
                        key={level._id}
                        level={level}
                        edit={true}
                        show-creator={true}
                      />
                    ))
                  )
                : null}
            </div>
          </div>
          <nav className="text-center">
            <ul className="pagination">
              {this.state.currentPage.likedLevels !== 1 ? (
                <li>
                  <a
                    onClick={() =>
                      this.loadCreatedPages(
                        this.state.currentPage.likedLevels - 1
                      )
                    }
                  >
                    <h3>« Prev </h3>
                  </a>
                </li>
              ) : (
                <li>
                  <a className="disabled">
                    <h3>« Prev </h3>
                  </a>
                </li>
              )}
              {this.state.likedLevelsRows &&
                this.state.pages.likedLevels.map(page => (
                  <li
                    key={page}
                    className={
                      page == this.state.currentPage.likedLevels ? "active" : ""
                    }
                  >
                    <a
                      className={
                        page == this.state.currentPage.likedLevels
                          ? "disabled"
                          : ""
                      }
                      onClick={() => this.loadCreatedPages(page)}
                    >
                      <h3>{page}</h3>
                    </a>
                  </li>
                ))}
              {this.state.likedLevelsRows &&
              this.state.currentPage.likedLevels !==
                this.state.pages.likedLevels.length ? (
                <li>
                  <a
                    onClick={() =>
                      this.loadCreatedPages(
                        this.state.currentPage.likedLevels + 1
                      )
                    }
                  >
                    <h3>Next »</h3>
                  </a>
                </li>
              ) : (
                <li>
                  <a className="disabled">
                    <h3>Next »</h3>
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    );
  }
}
const mapStateToProps = ({ auth, profile }) => {
  return {
    auth,
    profile
  };
};
export default connect(
  mapStateToProps,
  { fetchOwnProfile, fetchProfileLevels }
)(Profile);
