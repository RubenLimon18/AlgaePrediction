// src/assets/js/chart-init.js

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
  
  