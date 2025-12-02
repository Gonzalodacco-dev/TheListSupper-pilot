// Cambiaría el event listener de:
vozBtn.addEventListener('click', iniciarReconocimientoVoz);

// A:
vozBtn.addEventListener('mousedown', iniciarReconocimientoVoz);
vozBtn.addEventListener('mouseup', finalizarReconocimientoVoz);
vozBtn.addEventListener('mouseleave', finalizarReconocimientoVoz); // por si sacás el mouse