// Estado de la aplicación
let groups = JSON.parse(localStorage.getItem('superListGroups')) || [
    {
        id: 1,
        name: "Panadería",
        collapsed: false,
        items: [
            { id: 101, name: "Pan", color: "pendiente" },
            { id: 102, name: "Facturas", color: "pendiente" }
        ]
    },
    {
        id: 2,
        name: "Lácteos y Heladera",
        collapsed: false,
        items: [
            { id: 201, name: "Leche", color: "pendiente" },
            { id: 202, name: "Queso", color: "pendiente" },
            { id: 203, name: "Yogur", color: "pendiente" }
        ]
    },
    {
        id: 3,
        name: "Limpieza",
        collapsed: false,
        items: [
            { id: 301, name: "Lavandina", color: "pendiente" },
            { id: 302, name: "Detergente", color: "pendiente" }
        ]
    }
];

let nextGroupId = 4;
let nextItemId = 303;
let draggedItem = null;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    renderGroups();
    updateStats();
    
    // Event listeners para botones
    document.getElementById('addGroupBtn').addEventListener('click', addNewGroup);
    document.getElementById('addItemBtn').addEventListener('click', addNewItem);
    document.getElementById('newItemInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewItem();
        }
    });
});

// Renderizar grupos
function renderGroups() {
    const groupsContainer = document.getElementById('groupsContainer');
    groupsContainer.innerHTML = '';

    if (groups.length === 0) {
        groupsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list fa-3x" style="margin-bottom: 15px; color: #a0aec0;"></i>
                <p>No hay grupos aún. ¡Crea tu primer grupo para organizar tu lista!</p>
            </div>
        `;
        return;
    }

    groups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.className = `group ${group.collapsed ? 'collapsed' : ''}`;
        groupElement.dataset.groupId = group.id;
        
        groupElement.innerHTML = `
            <div class="group-header">
                <div class="group-title">
                    <i class="fas fa-${group.collapsed ? 'chevron-down' : 'chevron-up'}"></i>
                    <span>${group.name}</span>
                    <span class="item-count">[${group.items.length}]</span>
                </div>
                <div class="group-actions">
                    <button class="delete-group" title="Eliminar grupo">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="group-items">
                ${group.items.length > 0 ? 
                    group.items.map(item => `
                        <div class="item" draggable="true" data-item-id="${item.id}" data-group-id="${group.id}">
                            <div class="item-color ${item.color}" data-item-id="${item.id}"></div>
                            <div class="item-name">${item.name}</div>
                            <div class="item-actions">
                                <button class="delete-item" title="Eliminar ítem">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    `).join('') : 
                    '<div class="empty-state">No hay ítems en este grupo</div>'
                }
                <div class="drop-zone" data-group-id="${group.id}">
                    Arrastra ítems aquí para moverlos
                </div>
            </div>
        `;
        
        groupsContainer.appendChild(groupElement);
    });

    // Añadir event listeners después de renderizar
    addGroupEventListeners();
    addDragAndDropListeners();
}

// Añadir event listeners a los grupos
function addGroupEventListeners() {
    // Toggle colapsar/expandir grupo
    document.querySelectorAll('.group-header').forEach(header => {
        header.addEventListener('click', function(e) {
            if (!e.target.closest('.group-actions')) {
                const groupId = parseInt(this.closest('.group').dataset.groupId);
                toggleGroupCollapse(groupId);
            }
        });
    });

    // Eliminar grupo
    document.querySelectorAll('.delete-group').forEach(button => {
        button.addEventListener('click', function() {
            const groupId = parseInt(this.closest('.group').dataset.groupId);
            deleteGroup(groupId);
        });
    });

    // Cambiar color del ítem
    document.querySelectorAll('.item-color').forEach(colorElement => {
        colorElement.addEventListener('click', function() {
            const itemId = parseInt(this.dataset.itemId);
            changeItemColor(itemId);
        });
    });

    // Eliminar ítem
    document.querySelectorAll('.delete-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.closest('.item').dataset.itemId);
            const groupId = parseInt(this.closest('.item').dataset.groupId);
            deleteItem(groupId, itemId);
        });
    });
}

// Añadir funcionalidad de arrastrar y soltar
function addDragAndDropListeners() {
    // Ítems arrastrables
    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('dragstart', function(e) {
            draggedItem = {
                itemId: parseInt(this.dataset.itemId),
                groupId: parseInt(this.dataset.groupId)
            };
            this.classList.add('dragging');
            e.dataTransfer.setData('text/plain', '');
        });

        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            document.querySelectorAll('.drop-zone').forEach(zone => {
                zone.classList.remove('active');
            });
        });
    });

    // Zonas de destino
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('active');
        });

        zone.addEventListener('dragleave', function() {
            this.classList.remove('active');
        });

        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('active');
            
            if (draggedItem) {
                const targetGroupId = parseInt(this.dataset.groupId);
                moveItemToGroup(draggedItem.groupId, draggedItem.itemId, targetGroupId);
                draggedItem = null;
            }
        });
    });
}

// Funciones de la aplicación
function addNewGroup() {
    const groupName = prompt("Nombre del nuevo grupo:");
    if (groupName && groupName.trim() !== '') {
        groups.push({
            id: nextGroupId++,
            name: groupName.trim(),
            collapsed: false,
            items: []
        });
        saveToLocalStorage();
        renderGroups();
    }
}

function addNewItem() {
    const itemInput = document.getElementById('newItemInput');
    const itemName = itemInput.value.trim();
    
    if (itemName === '') {
        alert("Por favor, escribe un nombre para el ítem.");
        return;
    }

    if (groups.length > 0) {
        const firstGroup = groups[0];
        firstGroup.items.push({
            id: nextItemId++,
            name: itemName,
            color: 'pendiente'
        });
        
        saveToLocalStorage();
        renderGroups();
        updateStats();
        itemInput.value = '';
    } else {
        alert("Primero crea un grupo para agregar ítems.");
    }
}

function toggleGroupCollapse(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        group.collapsed = !group.collapsed;
        saveToLocalStorage();
        renderGroups();
    }
}

function deleteGroup(groupId) {
    if (confirm("¿Estás seguro de que quieres eliminar este grupo y todos sus ítems?")) {
        groups = groups.filter(g => g.id !== groupId);
        saveToLocalStorage();
        renderGroups();
        updateStats();
    }
}

function changeItemColor(itemId) {
    const colors = ['pendiente', 'chango', 'omitido', 'oferta'];
    let item = null;
    let group = null;
    
    for (const g of groups) {
        item = g.items.find(i => i.id === itemId);
        if (item) {
            group = g;
            break;
        }
    }
    
    if (item) {
        const currentColorIndex = colors.indexOf(item.color);
        const nextColorIndex = (currentColorIndex + 1) % colors.length;
        item.color = colors[nextColorIndex];
        
        saveToLocalStorage();
        renderGroups();
        updateStats();
    }
}

function deleteItem(groupId, itemId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        group.items = group.items.filter(i => i.id !== itemId);
        saveToLocalStorage();
        renderGroups();
        updateStats();
    }
}

function moveItemToGroup(sourceGroupId, itemId, targetGroupId) {
    if (sourceGroupId === targetGroupId) return;
    
    const sourceGroup = groups.find(g => g.id === sourceGroupId);
    const targetGroup = groups.find(g => g.id === targetGroupId);
    
    if (sourceGroup && targetGroup) {
        const itemIndex = sourceGroup.items.findIndex(i => i.id === itemId);
        if (itemIndex !== -1) {
            const [item] = sourceGroup.items.splice(itemIndex, 1);
            targetGroup.items.push(item);
            
            saveToLocalStorage();
            renderGroups();
            updateStats();
        }
    }
}

function updateStats() {
    let totalItems = 0;
    let pendientes = 0;
    let enChango = 0;
    let omitidos = 0;
    let ofertas = 0;
    
    groups.forEach(group => {
        totalItems += group.items.length;
        group.items.forEach(item => {
            switch(item.color) {
                case 'pendiente': pendientes++; break;
                case 'chango': enChango++; break;
                case 'omitido': omitidos++; break;
                case 'oferta': ofertas++; break;
            }
        });
    });
    
    const statsElement = document.getElementById('stats');
    statsElement.innerHTML = `
        <div class="stat">
            <div class="stat-value">${totalItems}</div>
            <div class="stat-label">Total</div>
        </div>
        <div class="stat">
            <div class="stat-value">${pendientes}</div>
            <div class="stat-label">Pendientes</div>
        </div>
        <div class="stat">
            <div class="stat-value">${enChango}</div>
            <div class="stat-label">En chango</div>
        </div>
        <div class="stat">
            <div class="stat-value">${omitidos}</div>
            <div class="stat-label">Omitidos</div>
        </div>
        <div class="stat">
            <div class="stat-value">${ofertas}</div>
            <div class="stat-label">Ofertas</div>
        </div>
    `;
}

function saveToLocalStorage() {
    localStorage.setItem('superListGroups', JSON.stringify(groups));
}