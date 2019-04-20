import React from "react";
import "./LeaderBoard.css";
export default function LeaderBoard(props) {
  return (
    <div class="leaderboard">
      <h2>{props.achievement}</h2>
      <ol>
        <li ng-repeat="creator in list">
          <h5>
            <a>Sagar Kharbe</a> <span ng-class="countType">&#9733; 8</span>
          </h5>
        </li>
        <li ng-repeat="creator in list">
          <h5>
            <a>Tarun Manchu</a> <span ng-class="countType">&#9733; 5</span>
          </h5>
        </li>
        <li ng-repeat="creator in list">
          <h5>
            <a>Ravi Kiran </a> <span ng-class="countType">&#9733; 5</span>
          </h5>
        </li>
        <li ng-repeat="creator in list">
          <h5>
            <a>Kaushik</a> <span ng-class="countType">&#9733; 5</span>
          </h5>
        </li>
        <li ng-repeat="creator in list">
          <h5>
            <a>Umesh Yadav</a> <span ng-class="countType">&#9733; 3</span>
          </h5>
        </li>
        <li ng-repeat="creator in list">
          <h5>
            <a>Surya Dutta</a> <span ng-class="countType">&#9733; 2</span>
          </h5>
        </li>
      </ol>
    </div>
  );
}
