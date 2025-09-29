import { useRef, useEffect } from "react";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const ActivityChart = ({ activities, socket }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const updateChart = (activityList) => {
    if (!chartInstanceRef.current) return;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const totals = { transport: 0, food: 0, energy: 0, waste: 0 };
    activityList.forEach((act) => {
      const actDate = new Date(act.timestamp);
      if (actDate < weekStart) return;
      totals[act.category] =
        (totals[act.category] || 0) + (act.co2Emissions || 0);
    });

    const colorMap = {
      transport: "#3182ce",
      food: "#38a169",
      energy: "#d69e2e",
      waste: "#e53e3e",
    };

    const entries = Object.entries(totals).filter(([, value]) => value > 0);

    chartInstanceRef.current.data.labels = entries.map(
      ([key]) => key.charAt(0).toUpperCase() + key.slice(1)
    );
    chartInstanceRef.current.data.datasets[0].data = entries.map(
      ([, value]) => value
    );
    chartInstanceRef.current.data.datasets[0].backgroundColor = entries.map(
      ([key]) => colorMap[key]
    );

    chartInstanceRef.current.update();
  };

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { padding: 20, usePointStyle: true },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = ctx.parsed;
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${ctx.label}: ${value.toFixed(
                  1
                )} kg CO₂ (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    updateChart(activities);

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [activities]);

  useEffect(() => {
    if (!socket) return;

    const handleActivityAdded = (data) => {
      updateChart([...activities, data]);
    };
    const handleActivityDeleted = (data) => {
      updateChart(activities.filter((a) => a._id !== data._id));
    };

    socket.on("activity-added", handleActivityAdded);
    socket.on("activity-deleted", handleActivityDeleted);

    return () => {
      socket.off("activity-added", handleActivityAdded);
      socket.off("activity-deleted", handleActivityDeleted);
    };
  }, [activities, socket]);

  return (
    <div className="chart-container" style={{ height: "350px", width: "100%" }}>
      <canvas ref={chartRef} style={{ width: "100%", height: "100%" }}></canvas>
    </div>
  );
};

export default ActivityChart;
