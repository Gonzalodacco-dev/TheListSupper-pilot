// Pegá en la consola para exportar YA:
const data = localStorage.getItem('superListGroups');
const blob = new Blob([data], {type: 'application/json'});
const url = URL.createObjectURL(blob);
window.open(url);