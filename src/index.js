import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import fetchAvailabilityByRoomName from "./deskeo";

import "./styles.css";

function App() {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!idle) {
      (async _ => {
        try {
          setAvailability(
            await fetchAvailabilityByRoomName(
              {
                cookie: process.env.DESKEO_COOKIE,
                start: "2019-10-18",
                end: "2019-10-19"
              },
              _ => setLoading(false)
            )
          );
        } catch (error) {
          setError(error.stack);
          setLoading(false);
        }
      })();
      setIdle(true);
    }
  }, [idle]);

  return (
    <div className="App">
      <h1>Salles Deskeo disponibles</h1>
      {loading && (
        <img
          src="https://gifimage.net/wp-content/uploads/2018/11/loading-gif-cdn-2.gif"
          alt="Loading.."
          width="200"
        />
      )}
      {error && (
        <div style={{ color: "red", fontStyle: "italic" }}>{error}</div>
      )}
      {Object.keys(availability).map((roomName, i) => {
        return (
          <div key={i}>
            <h1>{roomName}</h1>
            {availability[roomName].map((reservation, j) => {
              return (
                <div key={j}>
                  {reservation.start} => {reservation.end}
                  <br />
                  <br />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
