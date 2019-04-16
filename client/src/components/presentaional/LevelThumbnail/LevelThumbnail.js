import React, { Component } from "react";
import "./LevelThumbnail.css";
import { Link } from "react-router-dom";
export default class LevelThumbnail extends Component {
  deleteLevel = () => {
    console.log("Delete Level Clicked");
  };
  render() {
    return (
      <div className="level-box">
        <div className="">
          <Link to={"/createlevel/" + this.props.level._id}>
            <img
              src={
                "https://s3.amazonaws.com/bridge-bali-test/" +
                this.props.level._id +
                ".png"
              }
              alt=""
            />
          </Link>
          <div>
            {!this.props.edit ? (
              <h5 className="star-count">
                <span className="glyphicon glyphicon-star" />
                {this.props.level.starCount}
              </h5>
            ) : (
              <a className="btn btn-delete" onClick={this.deleteLevel}>
                <span className="glyphicon glyphicon-remove" /> DELETE
              </a>
            )}
            <h5>{this.props.level.title}</h5>
            {!this.props.edit ? (
              <h6>
                Created by{" "}
                <a href="levels?creator={this.props.level.creator.name}">
                  {this.props.level.creator.name}
                </a>
              </h6>
            ) : null}
            <h6>on {this.props.level.dateCreated}</h6>
          </div>
        </div>
      </div>
    );
  }
}
