import { useEffect, useState } from "react";

const RealTimeTip = ({ refId = "real-time-tip" }) => {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      const msg = e?.detail?.message || "";
      setMessage(msg);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };

    window.addEventListener("realtime-tip", handler);
    return () => window.removeEventListener("realtime-tip", handler);
  }, []);

  return (
    <div id={refId} className={`real-time-tip ${visible ? "show" : ""}`}>
      <i className="fa-solid fa-bell"></i>
      <span className="tip-message">{message}</span>
    </div>
  );
};

export default RealTimeTip;
