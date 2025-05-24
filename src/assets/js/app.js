document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('sidebarToggle');
  const toggleTopBtn = document.getElementById('sidebarToggleTop');
  const body = document.body;
  const sidebar = document.querySelector('.sidebar');

  // Function to toggle sidebar
  function toggleSidebar() {
    const isToggled = sidebar.classList.toggle('toggled');
    body.classList.toggle('sidebar-toggled', isToggled);

    // Si está colapsado, cierra los menús
    if (isToggled) {
      const collapses = sidebar.querySelectorAll('.collapse.show');
      collapses.forEach(c => new bootstrap.Collapse(c, { toggle: false }).hide());
    }

    // Actualiza los márgenes de los textos (ms-2) según estado
    updateNavLinkSpacing();
  }

  // Add click event to both toggle buttons
  toggleBtn.addEventListener('click', toggleSidebar);
  toggleTopBtn.addEventListener('click', toggleSidebar);

  function updateNavLinkSpacing() {
    const spans = document.querySelectorAll('.nav-link span');
    spans.forEach(span => {
      if (sidebar.classList.contains('toggled')) {
        span.classList.remove('ms-2');
      } else {
        span.classList.add('ms-2');
      }
    });
  }

  // Manejar redimensionamiento para ocultar sidebar en pantallas pequeñas
  function handleResize() {
    const isSmallScreen = window.innerWidth < 768; // Ajusta el breakpoint si quieres

    if (isSmallScreen) {
      // En pantallas pequeñas siempre ocultar sidebar al cargar
      if (!sidebar.classList.contains('toggled')) {
        sidebar.classList.add('toggled');
        body.classList.add('sidebar-toggled');
        updateNavLinkSpacing();
      }
    } else {
      // En pantallas grandes: si sidebar estaba abierto, mantener abierto y actualizado
      if (sidebar.classList.contains('toggled')) {
        updateNavLinkSpacing();
      }
    }
  }

  window.addEventListener('resize', handleResize);

  // Ejecutar una vez al cargar
  handleResize();
});