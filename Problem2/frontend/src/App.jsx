import React, { useState } from "react";
import diff_match_patch from "diff-match-patch";

const App = () => {
  const [text, setText] = useState("");
  const [lastSavedText, setLastSavedText] = useState("");
  const [typing, setTyping] = useState(false);
  const [timestamps, setTimestamps] = useState({ start: null, end: null });
  const [changes, setChanges] = useState([]);

  let typingTimeout;

  const handleChange = (e) => {
    if (!typing) {
      setTimestamps({ ...timestamps, start: new Date() });
      setTyping(true);
    }

    setText(e.target.value);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      handleTypingStopped();
    }, 1000); // 1 second delay after typing stops
  };

  const handleTypingStopped = () => {
    setTyping(false);
    setTimestamps({ ...timestamps, end: new Date() });
    autoSave();
  };

  const autoSave = () => {
    if (text !== lastSavedText) {
      const diff = getDifference(lastSavedText, text);
      setLastSavedText(text);
      console.log("Text:", text);
      console.log("Timestamps:", timestamps);
      console.log("Difference:", diff);
      // Call the API to save the diff
      saveText(diff);

      // Add new change to the changes array
      setChanges([
        ...changes,
        {
          timestamp: new Date().toLocaleString(),
          diff,
        },
      ]);
    }
  };

  const getDifference = (oldText, newText) => {
    const dmp = new diff_match_patch();
    const diff = dmp.diff_main(oldText, newText);
    dmp.diff_cleanupSemantic(diff);
    return diff;
  };

  const saveText = async (diff) => {
    try {
      await fetch("http://localhost:5000/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ diff, timestamps }),
      });
    } catch (error) {
      console.error("Error saving text:", error);
    }
  };

  return (
    <div>
      <textarea value={text} onChange={handleChange} rows="10" cols="30" />
      <table border="1">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((change, index) => (
            <tr key={index}>
              <td>{change.timestamp}</td>
              <td>
                {change.diff.map(([op, data], i) => (
                  <span
                    key={i}
                    style={{
                      color: op === 1 ? "green" : op === -1 ? "red" : "black",
                    }}
                  >
                    {op !== 0
                      ? data.split("").map((char, j) => (
                          <span
                            key={j}
                            style={{
                              textDecoration:
                                op === -1 ? "line-through" : "none",
                            }}
                          >
                            {char}
                          </span>
                        ))
                      : data}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
