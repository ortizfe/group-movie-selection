import React, { useMemo, useRef, useState } from "react";
import TinderCard from "react-tinder-card";

type Direction = "left" | "right" | "up" | "down";
interface Movie {
  id: string;
  title: string;
  release: string;
  url: string;
}

const movies: Movie[] = [
  {
    id: "1",
    title: "The Dark Knight",
    release: "2008",
    url: "https://images.unsplash.com/photo-1478720568477-152d9b164e63?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "2",
    title: "Inception",
    release: "2010",
    url: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "3",
    title: "Interstellar",
    release: "2014",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "4",
    title: "Dunkirk",
    release: "2017",
    url: "https://images.unsplash.com/photo-1579935110464-fcd705142bad?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "5",
    title: "Tenet",
    release: "2020",
    url: "https://images.unsplash.com/photo-1639322537228-ad71e7552295?auto=format&fit=crop&w=500&q=60",
  },
];
interface TinderCardRef {
  swipe: (dir: Direction) => Promise<void>;
  restoreCard: () => Promise<void>;
}
interface TinderCardProps {
  children?: React.ReactNode;
  className?: string;
  onSwipe?: (dir: Direction) => void;
  onCardLeftScreen?: (dir: Direction) => void;
  preventSwipe?: Direction[];
}

const TinderSwiping = () => {
  const [currentIndex, setCurrentIndex] = useState(movies.length - 1);
  const [lastDirection, setLastDirection] = useState("");

  const currentIndexRef = useRef(currentIndex);

  const childRefs = useMemo<React.RefObject<TinderCardRef>[]>(
    () =>
      Array(movies.length)
        .fill(0)
        .map(() => React.createRef<TinderCardRef>()),
    []
  );

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < movies.length - 1;

  const canSwipe = currentIndex >= 0;

  const swiped = (direction: string, movieToDelete: string, index: number) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
  };

  const outOfFrame = (movie: string, idx: number) => {
    console.log(`${movie} left the screen`);

    if (currentIndexRef.current >= idx && childRefs[idx].current) {
      childRefs[idx].current!.restoreCard();
    }
  };

  const swipe = async (dir: Direction) => {
    if (canSwipe && currentIndex < movies.length) {
      if (childRefs[currentIndex].current) {
        await childRefs[currentIndex].current!.swipe(dir);
      }
    }
  };

  const goBack = async () => {
    if (!canGoBack) return;

    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    if (childRefs[newIndex].current) {
      await childRefs[newIndex].current!.restoreCard();
    }
  };

  const onSwipe = (direction: string) => {
    console.log("You swiped: " + direction);
  };

  const onCardLeftScreen = (myIdentifier: string) => {
    console.log(myIdentifier + " left the screen");
  };

  return (
    <React.Fragment>
      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .card-container {
          width: 300px;
          height: 400px;
          position: relative; /* REQUIRED for stacking */
        }
        .swipe {
          position: absolute; /* REQUIRED for stacking */
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .card-content {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          border-radius: 20px;
          box-shadow: 0px 4px 20px rgba(0,0,0,0.2);
          display: flex;
          align-items: flex-end;
        }
        .card-content h3 {
          color: white;
          margin: 10px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        }
        .buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        .buttons button {
            padding: 10px 20px;
            border-radius: 20px;
            border: none;
            cursor: pointer;
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
      `}</style>
      <div className="card-container">
        {movies.map((movie, index) => (
          <TinderCard
            ref={childRefs[index]}
            className="swipe"
            key={movie.id}
            onSwipe={(dir) => swiped(dir, movie.title, index)}
            onCardLeftScreen={() => outOfFrame(movie.title, index)}
            preventSwipe={["up", "down"]}
          >
            <div
              className="card-content"
              style={{ backgroundImage: `url(${movie.url})` }}
            >
              <h3>{movie.title}</h3>
            </div>
          </TinderCard>
        ))}
        <div className="buttons">
          <button onClick={() => swipe("left")} disabled={!canSwipe}>
            Swipe Left
          </button>
          <button onClick={() => goBack()} disabled={!canGoBack}>
            Undo
          </button>
          <button onClick={() => swipe("right")} disabled={!canSwipe}>
            Swipe Right
          </button>
        </div>
        {lastDirection ? (
          <h2 key={lastDirection} className="infoText">
            You swiped {lastDirection}
          </h2>
        ) : (
          <h2 className="infoText">
            Swipe a card or press a button to get Restore Card button visible!
          </h2>
        )}
      </div>
    </React.Fragment>
  );
};

export default TinderSwiping;
