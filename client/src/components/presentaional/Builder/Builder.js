import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { fetchUser } from "../../../actions/authAction";
class Builder extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props.auth);
  }
  static propTypes = {
    auth: PropTypes.object.isRequired
  };

  goToCreate = () => {
    console.log("GO TO Create func");
  };
  render() {
    return (
      <React.Fragment>
        <div>
          Welcome, {this.props.auth.user.name}. You've created
          {this.props.auth.user.createdLevels.length}levels so far.
        </div>

        <header>
          <div style={{ margin: "auto" }}>
            <nav>
              <ul>
                <li>
                  <a onClick={this.goToCreate}>Create new level</a>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <div className="draft-list">
          <h2>Your Drafts</h2>
          <div className="row" ng-repeat="draftRow in drafts">
            {/* <level-thumbnail ng-repeat="draft in draftRow" level="draft" edit="true" show-creator="true"></level-thumbnail> */}
          </div>
        </div>

        <div ng-show="user.createdLevels.length">
          <nav>
            <ul>
              <li>Edit level</li>
            </ul>
          </nav>
        </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = ({ auth }) => {
  return { auth };
};
export default connect(
  mapStateToProps,
  { fetchUser }
)(Builder);
