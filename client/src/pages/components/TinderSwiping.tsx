import React from "react";
import TinderCard from "react-tinder-card";

const TinderSwiping = () => {
  const onSwipe = (direction: string) => {
    console.log("You swiped: " + direction);
  };

  const onCardLeftScreen = (myIdentifier: string) => {
    console.log(myIdentifier + " left the screen");
  };

  return (
    <React.Fragment>
      <TinderCard
        onSwipe={onSwipe}
        onCardLeftScreen={() => onCardLeftScreen("Movie")}
        preventSwipe={["up", "down"]}
      >
        Hello bitch
      </TinderCard>
    </React.Fragment>
  );
};

export default TinderSwiping;
