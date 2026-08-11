let powerChart = null;
let currentRange = "live";

const chartData = {
  labels: [],
  pv: [],
  bat: [],
  grid: [],
  load: []
};

function createTestData() {
  chartData.labels = [];
  chartData.pv = [];
  chartData.bat = [];
  chartData.grid = [];
  chartData.load = [];

  const now = new Date();

  for (let i = 59; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 30000);

    chartData.labels.push(
      t.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    );

    chartData.pv.push(Math.round(1200 + Math.random() * 1800));
    chartData.bat.push(Math.round(-500 + Math.random() * 1000));
    chartData.grid.push(Math.round(Math.random() * 800));
    chartData.load.push(Math.round(1000 + Math.random() * 1800));
  }
}

function createChart() {
  const canvas = document.getElementById("powerChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  powerChart = new Chart(ctx, {
    type: "line",

    data: {
      labels: chartData.labels,

      datasets: [
        {
          label: "PV",
          data: chartData.pv,
          borderColor: "#ffd43b",
          backgroundColor: "#ffd43b",
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2
        },

        {
          label: "Battery",
          data: chartData.bat,
          borderColor: "#00d078",
          backgroundColor: "#00d078",
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2
        },

        {
          label: "Grid",
          data: chartData.grid,
          borderColor: "#ff5555",
          backgroundColor: "#ff5555",
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2
        },

        {
          label: "Load",
          data: chartData.load,
          borderColor: "#4da6ff",
          backgroundColor: "#4da6ff",
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: "index",
        intersect: false
      },

      plugins: {
        legend: {
          display: false
        },

        tooltip: {
          mode: "index",
          intersect: false,

          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} W`;
            }
          }
        }
      },

      scales: {
        x: {
          ticks: {
            color: "#aaa",
            maxTicksLimit: 10
          },

          grid: {
            color: "rgba(255,255,255,0.05)"
          }
        },

        y: {
          ticks: {
            color: "#aaa",

            callback: function(value) {
              if (Math.abs(value) >= 1000) {
                return (value / 1000).toFixed(1) + " kW";
              }

              return value + " W";
            }
          },

          grid: {
            color: "rgba(255,255,255,0.08)"
          }
        }
      }
    }
  });
}
function initChartCheckboxes() {
  document
    .querySelectorAll(".chart-legend input[type='checkbox']")
    .forEach(box => {

      box.addEventListener("change", () => {
        if (!powerChart) return;

        const map = {
          pv: 0,
          bat: 1,
          grid: 2,
          load: 3
        };

        const index = map[box.dataset.series];

        powerChart.setDatasetVisibility(
          index,
          box.checked
        );

        powerChart.update();
      });
    });
}
function initChartRangeButtons() {
  const buttons = document.querySelectorAll(".chart-range");
  const daySelect = document.getElementById("chart_day_select");

  buttons.forEach(button => {

    button.addEventListener("click", () => {

      buttons.forEach(b => b.classList.remove("active"));
      button.classList.add("active");

      currentRange = button.dataset.range;

      if (currentRange === "day") {
        daySelect.classList.remove("hidden");
      } else {
        daySelect.classList.add("hidden");
      }

      console.log("Chart range:", currentRange);
    });

  });
}
window.addEventListener("load", () => {
  createTestData();
  createChart();
  initChartCheckboxes();
  initChartRangeButtons();
});