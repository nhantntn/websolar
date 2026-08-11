let powerChart = null;
let currentRange = "live";
let historyUnsubscribe = null;

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

      animation: {
        duration: 350
        },

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
            maxTicksLimit: window.innerWidth <= 600 ? 5 : 10,
            maxRotation: 0,
            autoSkip: true,

            callback: function(value) {
                const label = this.getLabelForValue(value);

                if (window.innerWidth <= 600) {
                return label.substring(0, 5);
                }

                return label;
            }
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

      if (currentRange === "live") {
        startLiveChart();
        return;
      }

      // Tạm thời 12h / 24h / Ngày vẫn dùng dữ liệu test
      loadTestRange(currentRange);
      updateChartData(chartData);
    });

  });
}

function loadTestRange(range) {
  chartData.labels = [];
  chartData.pv = [];
  chartData.bat = [];
  chartData.grid = [];
  chartData.load = [];

  const now = new Date();

  let points = 60;
  let stepMs = 30000;

  if (range === "12h") {
    points = 24;
    stepMs = 30 * 60 * 1000;
  }

  if (range === "day") {
    points = 24;
    stepMs = 60 * 60 * 1000;
  }

  if (range === "24h") {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    for (let h = 0; h < 24; h++) {
        const t = new Date(today.getTime() + h * 60 * 60 * 1000);

        chartData.labels.push(
        t.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        })
        );

        chartData.pv.push(Math.round(1200 + Math.random() * 1800));
        chartData.bat.push(Math.round(-500 + Math.random() * 1000));
        chartData.grid.push(Math.round(Math.random() * 800));
        chartData.load.push(Math.round(1000 + Math.random() * 1800));
    }

    return;
    }
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * stepMs);

    chartData.labels.push(
      t.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );

    chartData.pv.push(Math.round(1200 + Math.random() * 1800));
    chartData.bat.push(Math.round(-500 + Math.random() * 1000));
    chartData.grid.push(Math.round(Math.random() * 800));
    chartData.load.push(Math.round(1000 + Math.random() * 1800));
  }
}

function updateChartData(data) {
  if (!powerChart) return;

  powerChart.data.labels = data.labels;
  powerChart.data.datasets[0].data = data.pv;
  powerChart.data.datasets[1].data = data.bat;
  powerChart.data.datasets[2].data = data.grid;
  powerChart.data.datasets[3].data = data.load;

  powerChart.update("none");
}

function getDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function historyKeyToSeconds(key) {
  const p = key.split("-");

  if (p.length !== 3) return -1;

  return (
    Number(p[0]) * 3600 +
    Number(p[1]) * 60 +
    Number(p[2])
  );
}

function buildLiveData(history) {
  const labels = [];
  const pv = [];
  const bat = [];
  const grid = [];
  const load = [];

  const now = new Date();

  // Ép về đúng slot 30 giây hiện tại
  let nowSeconds =
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds();

  nowSeconds = Math.floor(nowSeconds / 30) * 30;

  // Tạo map dữ liệu Firebase theo số giây trong ngày
  const historyMap = {};

  if (history) {
    Object.entries(history).forEach(([key, value]) => {
      const sec = historyKeyToSeconds(key);

      if (sec >= 0) {
        historyMap[sec] = value;
      }
    });
  }

  // 60 điểm = 30 phút
  for (let i = 59; i >= 0; i--) {
    const sec = nowSeconds - i * 30;

    let realSec = sec;

    // Giai đoạn đầu Live chỉ đọc ngày hiện tại.
    if (realSec < 0) realSec = 0;

    const h = Math.floor(realSec / 3600);
    const m = Math.floor((realSec % 3600) / 60);
    const s = realSec % 60;

    labels.push(
      `${String(h).padStart(2, "0")}:` +
      `${String(m).padStart(2, "0")}:` +
      `${String(s).padStart(2, "0")}`
    );

    const sample = historyMap[realSec];

    if (sample) {
      pv.push(Number(sample.pv) || 0);
      bat.push(Number(sample.bat) || 0);
      grid.push(Number(sample.grid) || 0);
      load.push(Number(sample.load) || 0);
    } else {
      // Không có sample = 0 đúng như ta đã thống nhất
      pv.push(0);
      bat.push(0);
      grid.push(0);
      load.push(0);
    }
  }

  return {
    labels,
    pv,
    bat,
    grid,
    load
  };
}

function startLiveChart() {
  if (!window.chartFirebase) {
    console.error("Firebase chưa sẵn sàng cho Chart");
    return;
  }

  // Hủy listener cũ khi đổi chế độ hoặc đổi thiết bị
  if (historyUnsubscribe) {
    historyUnsubscribe();
    historyUnsubscribe = null;
  }

  const {
    db,
    ref,
    onValue
  } = window.chartFirebase;

  const deviceId = window.getChartDeviceId();
  const today = getDateKey();

  const historyRef = ref(
    db,
    `${deviceId}/history/${today}`
  );

  historyUnsubscribe = onValue(
    historyRef,

    snapshot => {
      if (currentRange !== "live") return;

      const history = snapshot.val() || {};

      const data = buildLiveData(history);

      updateChartData(data);
    },

    error => {
      console.error("❌ Lỗi đọc history:", error);
    }
  );
}

window.addEventListener("load", () => {
  chartData.labels = [];
  chartData.pv = [];
  chartData.bat = [];
  chartData.grid = [];
  chartData.load = [];

  createChart();

  initChartCheckboxes();
  initChartRangeButtons();

  startLiveChart();
});