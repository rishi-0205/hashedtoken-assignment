import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [dataList, setDataList] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  const startConnection = () => {
    const newSocket = new WebSocket("ws://localhost:3000");

    newSocket.onopen = () => {
      console.log("WebSocket connection established");
    };

    newSocket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      try {
        const response = await axios.get("http://localhost:3000/data");
        const data = response.data;
        setDataList((prevList) => [...prevList, data]);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    newSocket.onclose = (event) => {
      console.log("WebSocket connection closed", event);
    };

    setSocket(newSocket);
  };

  const closeConnection = () => {
    if (socket) {
      socket.close();
      setSocket(null);
      console.log("WebSocket connection closed manually");
    }
  };

  return (
    <div className="App">
      <div>
        <button onClick={startConnection} disabled={socket !== null}>
          Start Connection
        </button>
        <button onClick={closeConnection} disabled={socket === null}>
          Close Connection
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Counter</th>
            <th>Random String</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((data, index) => (
            <tr key={index}>
              <td>{data.counter}</td>
              <td>{data.randomString}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
