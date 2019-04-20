import React from "react";
import LeaderBoard from "../LeaderBoard/LeaderBoard";
import "./TopCreator.css";
export default function TopCreator() {
  return (
    <div class="top-creators">
      <div id="level-header">
        <h1>Top Creators</h1>
      </div>
      <div class="leaderboards">
        <LeaderBoard
          user-type="'Creators'"
          achievement={"MOST STARS"}
          list="mostStarred"
          select="'totalStars'"
        />
        <LeaderBoard
          user-type="'Creators'"
          achievement={"Most Followers"}
          list="mostFollowed"
          select="'totalFollowers'"
        />
        <LeaderBoard
          user-type="'Creators'"
          achievement={"Most Levels"}
          list="mostCreated"
          select="'totalCreatedLevels'"
        />
      </div>
      <div class="footer-blurb">
        <h3>
          Join these creators in the stars! Create a new level to earn your
          place in the rankings.
        </h3>
      </div>
    </div>
  );
}
