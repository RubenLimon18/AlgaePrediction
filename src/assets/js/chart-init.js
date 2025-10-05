// src/assets/js/chart-init.js

window.myCharts = window.myCharts || {};

window.initMyChart = function (canvasid, labels, data, algaes = [], label = 'Ventas') {
  const ctx = document.getElementById(canvasid)?.getContext('2d');
  if (!ctx) return;

  // Si ya existe un chart para este canvas, destruirlo
  if (window.myCharts[canvasid]) {
    window.myCharts[canvasid].destroy();
  }

  // Crear nuevo chart y guardar la instancia
  window.myCharts[canvasid] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        fill: true,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            callback: value => value.toLocaleString()
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            // Personalizar el título (aparece arriba en la tooltip)
            title: function(context) {
              return `Fecha: ${context[0].label}`;
            },
            // Personalizar la etiqueta (cuerpo de la tooltip)
            label: function(context) {
              const dataIndex = context.dataIndex;
              const algaeName = algaes[dataIndex] || 'Nombre no disponible';
              return [
                `Alga: ${algaeName}`,
                `Biomasa: ${context.parsed.y.toLocaleString()}`
              ];
            }
          }
        }
      }

    }
  });
};

//colores para las temporadas
const backgroundcolorMap = new Map([
  ['Rainy', 'rgba(28, 200, 138, 0.3)'],
  ['Dry', 'rgba(246, 194, 62, 0.3)'],
  ['Cold', 'rgba(78, 115, 223, 0.3)'],
]);

const bordercolorMap = new Map([
  ['Rainy', '#1cc88a'],
  ['Dry', '#f6c23e'],
  ['Cold', '#4e73df'],
]);

//grafica para temperatura - graph for temperature
window.initMyChartbar = function (
  canvasid, labels, data, sites = [], labell = 'Temperature', filterSeason
) {
  const ctx = document.getElementById(canvasid)?.getContext('2d');
  if (!ctx) return;

  // Si ya existe un chart para este canvas, destruirlo
  if (window.myCharts[canvasid]) {
    window.myCharts[canvasid].destroy();
  }

  // Crear arrays de colores dinámicos según filtro
  const backgroundColors = data.map(d => {
    if (!filterSeason) return 'rgba(75, 192, 192, 0.2)'; // Todos iguales si no hay filtro
    return d.season === filterSeason ? backgroundcolorMap.get(filterSeason): 'rgba(75, 192, 192, 0.2)';
  });

  const borderColors = data.map(d => {
    if (!filterSeason) return 'rgba(75, 192, 192, 1)';
    return d.season === filterSeason ? bordercolorMap.get(filterSeason) : 'rgba(75, 192, 192, 1)';
  });
   
  //color fijo para la leyenda
  const legendColor = filterSeason
    ? backgroundcolorMap.get(filterSeason)
    : 'rgba(75, 192, 192, 0.2)';

  //color fijo para la leyenda
  const legendBorderColor = filterSeason
    ? bordercolorMap.get(filterSeason)
    : 'rgba(75, 192, 192, 1)';

  // Crear nuevo chart y guardar la instancia
  window.myCharts[canvasid] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: labell,
        data: data.map(d => d.valor), // Valores numéricos
        borderColor: borderColors,
        backgroundColor: backgroundColors,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            callback: value => value.toLocaleString() + '°C'
          }
        }
      },
      plugins: {
         legend: {
          labels: {
            generateLabels: (chart) => {
              const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              labels.forEach(label => {
                label.fillStyle = legendColor; // 🔑 fuerza el color fijo en la leyenda
                label.strokeStyle = legendBorderColor;   // 🎨 color del borde (ejemplo: negro)
              });
              return labels;
            }
          }
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              return `${context[0].label}`;
            },
            label: function(context) {
              const dataIndex = context.dataIndex;
              const siteName = sites[dataIndex] || 'Nombre no disponible';
              return [
                `Site: ${siteName}`,
                `Temperature: ${context.parsed.y.toLocaleString()} °C`,
                `Season: ${data[dataIndex].season}`
              ];
            }
          }
        }
      }
    }
  });
};




// Chart Circle
window.initCircleChart = function () {
  const ctx = document.getElementById("myChartCircle")?.getContext('2d');
  if (!ctx) return;

  const labels = ["Directo", "Referencias", "Redes Sociales"];
  const data = [55, 30, 15];

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '85%', // Esto hace el anillo más delgado
      plugins: {
        tooltip: {
          backgroundColor: "rgb(255,255,255)",
          bodyColor: "#858796",
          borderColor: '#dddfeb',
          borderWidth: 1,
          padding: 15,
          displayColors: false,
          caretPadding: 10,

          // 👇 Aquí defines cómo mostrar el texto del tooltip
          callbacks: {
              label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              return `${label}: ${value}`;
              },
              
              title: () => null, 
          }
        },
        legend: {
          display: true,
          position: 'bottom',
          labels:{
              usePointStyle: true,    // Usa puntos en lugar de rectángulos
              pointStyle: 'circle',   // Forma del punto: 'circle', 'rect', 'triangle', etc.
              boxWidth: 8,            
              boxHeight: 8,           
              padding: 12,
          }
          
        }
      }
    }
  });
};








// window.initMyChart = function (labels, data) {
//     const ctx = document.getElementById('myChart')?.getContext('2d');
//     if (!ctx) return;
  
//     new Chart(ctx, {
//       type: 'line',
//       data: {
//         labels: labels,
//         datasets: [{
//           label: 'Ventas',
//           data: data,
//           fill: true,
//           borderColor: 'rgba(75, 192, 192, 1)',
//           backgroundColor: 'rgba(75, 192, 192, 0.2)',
//           tension: 0.3
//         }]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//           y: {
//             ticks: {
//               callback: value => '$' + value.toLocaleString()
//             }
//           }
//         }
//       }
//     });
//   };
  
  