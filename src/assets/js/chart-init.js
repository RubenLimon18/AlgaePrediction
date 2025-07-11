// src/assets/js/chart-init.js

// Chart Line
window.initMyChart = function (l, d) {
    const ctx = document.getElementById('myChart')?.getContext('2d');
    if (!ctx) return;
  
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: l,
        datasets: [{
          label: 'Ventas',
          data: d,
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
              callback: value => '$' + value.toLocaleString()
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
  
  