document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const toggleButton = document.getElementById("toggle-panel");
  const sidePanel = document.getElementById("side-panel");
  const zoomInButton = document.getElementById("zoom-in");
  const zoomOutButton = document.getElementById("zoom-out");
  const resetButton = document.getElementById("reset-button");
  const svg = document.querySelector("svg");
  const mapContainer = document.querySelector(".map-container");
  const roomAvailability = document.getElementById("room-availability");
  
  // Map state variables
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX, startY;
  let activeBuilding = null;
  
  // Boundary constraints to prevent dragging too far
  const maxTranslateX = 500;
  const maxTranslateY = 500;
  const minTranslateX = -500;
  const minTranslateY = -500;

  // Initialize the map
  initMap();

  // Toggle side panel visibility
  toggleButton.addEventListener("click", () => {
    sidePanel.classList.toggle("collapsed");
  });

  //helper function for side panel
  function openSidePanel() {
    sidePanel.classList.remove("collapsed");
  }

  // Initialize map transform and event listeners
  function initMap() {
    updateTransform();
    setupDragHandlers();
    setupZoomHandlers();
    setupBuildingClickHandlers();
    setupRoomClickHandlers();
    setupResetButton();
  }

  // Update SVG transform based on current scale and translation
  function updateTransform() {
    // Apply boundary constraints
    translateX = Math.max(minTranslateX, Math.min(maxTranslateX, translateX));
    translateY = Math.max(minTranslateY, Math.min(maxTranslateY, translateY));
    
    svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  // Setup drag handlers for map navigation
  function setupDragHandlers() {
    mapContainer.addEventListener("mousedown", (e) => {
      // Only drag on whitespace (not buildings/rooms)
      if (e.target === svg || e.target === mapContainer) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        mapContainer.style.cursor = "grabbing";
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      mapContainer.style.cursor = "grab";
    });
  }

  // Setup zoom handlers (buttons and wheel)
  function setupZoomHandlers() {
    // Zoom buttons
    zoomInButton.addEventListener("click", () => {
      zoom(1.1);
    });

    zoomOutButton.addEventListener("click", () => {
      zoom(1/1.1);
    });

    // Mouse wheel zoom
    svg.addEventListener("wheel", (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.1 : 1/1.1;
        zoom(zoomFactor, e.clientX, e.clientY);
      }
    });
  }

  // Zoom function with optional focus point
  function zoom(zoomFactor, clientX, clientY) {
    const oldScale = scale;
    scale *= zoomFactor;
    
    // Adjust translation to zoom toward mouse position
    if (clientX !== undefined && clientY !== undefined) {
      const rect = svg.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;
      
      translateX -= (offsetX - translateX) * (zoomFactor - 1);
      translateY -= (offsetY - translateY) * (zoomFactor - 1);
    }
    
    updateTransform();
  }

  // Setup building click handlers
  function setupBuildingClickHandlers() {
    const buildings = document.querySelectorAll(".building");
    
    buildings.forEach(building => {
      building.addEventListener("click", (e) => {
        e.stopPropagation();

        openSidePanel();
        
        // Reset previous active building
        if (activeBuilding) {
          activeBuilding.classList.remove("active");
          hideAllRooms();
        }
        
        // Set new active building
        activeBuilding = building;
        building.classList.add("active");
        
        // Show corresponding rooms
        const buildingId = building.id;
        const rooms = showRoomsForBuilding(buildingId);
        
        // Update side panel with building info
        updateBuildingInfo(buildingId, rooms);
      });
    });
  }

  // Show rooms for a specific building and return them
  function showRoomsForBuilding(buildingId) {
    const rooms = document.querySelectorAll(`.room.${buildingId}`);
    rooms.forEach(room => {
      room.classList.add("visible");
    });
    return rooms;
  }

  // Setup room click handlers
  function setupRoomClickHandlers() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("room") && e.target.classList.contains("visible")) {
        const roomElement = e.target;
        openSidePanel();
        updateRoomInfo(roomElement);
      }
    });
  }

  // Hide all rooms
  function hideAllRooms() {
    const rooms = document.querySelectorAll(".room");
    rooms.forEach(room => {
      room.classList.remove("visible");
    });
  }

  // Update side panel with building info
  function updateBuildingInfo(buildingId, rooms) {
    if (rooms.length === 0) {
      roomAvailability.innerHTML = `
        <h3>Building ${buildingId.toUpperCase()}</h3>
        <p>Status: Open</p>
        <p>No rooms available in this building</p>
      `;
      openSidePanel();
      return;
    }

    let roomsList = '';
    rooms.forEach(room => {
      const roomNumber = room.id.split('-').pop();
      roomsList += `<li class="room-item" data-room-id="${room.id}">Room ${roomNumber}</li>`;
    });

    roomAvailability.innerHTML = `
      <h3>Building ${buildingId.toUpperCase()}</h3>
      <p>Status: Open</p>
      <div class="room-list">
        <h4>Rooms:</h4>
        <ul>${roomsList}</ul>
      </div>
    `;

    // Add click handlers to room items in the list
    document.querySelectorAll('.room-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const roomId = e.target.getAttribute('data-room-id');
        const roomElement = document.getElementById(roomId);
        if (roomElement) {
          updateRoomInfo(roomElement);
        }
      });
    });
  }

  // Update side panel with room info
  function updateRoomInfo(roomElement) {
    const roomId = roomElement.id;
    const roomNumber = roomId.split('-').pop();
    
    // Sample room data - replace with your actual data source
    const roomData = {
      status: "Available",
      capacity: getRoomCapacity(roomNumber),
      type: getRoomType(roomNumber),
      lastCleaned: getLastCleanedDate(roomNumber)
    };

    roomAvailability.innerHTML = `
      <h3>Room ${roomNumber}</h3>
      <p>Status: ${roomData.status}</p>
      <p>Capacity: ${roomData.capacity}</p>
      <p>Type: ${roomData.type}</p>
      <p>Last cleaned: ${roomData.lastCleaned}</p>
      <button class="back-to-building">Back to Building</button>
    `;

    // Add back button handler
    document.querySelector('.back-to-building').addEventListener('click', () => {
      if (activeBuilding) {
        const buildingId = activeBuilding.id;
        const rooms = showRoomsForBuilding(buildingId);
        updateBuildingInfo(buildingId, rooms);
      }
    });
  }

  // Helper functions for room data - replace with your actual data source
  function getRoomCapacity(roomNumber) {
    // Sample implementation - replace with your data
    const capacities = {
      '101': 30,
      '102': 45,
      '103': 20,
      '104': 60
    };
    return capacities[roomNumber] || 25;
  }

  function getRoomType(roomNumber) {
    // Sample implementation - replace with your data
    const types = {
      '101': 'Classroom',
      '102': 'Lecture Hall',
      '103': 'Lab',
      '104': 'Conference Room'
    };
    return types[roomNumber] || 'Room';
  }

  function getLastCleanedDate(roomNumber) {
    // Sample implementation - replace with your data
    const dates = {
      '101': 'Today',
      '102': 'Yesterday',
      '103': '2 days ago',
      '104': 'This week'
    };
    return dates[roomNumber] || 'Recently';
  }

  // Setup reset button functionality
  function setupResetButton() {
    resetButton.style.display = "block"; // Always visible
    
    resetButton.addEventListener("click", () => {
      // Reset map position and scale
      scale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
      
      // Reset building and rooms
      if (activeBuilding) {
        activeBuilding.classList.remove("active");
        activeBuilding = null;
      }
      hideAllRooms();
      
      // Reset side panel
      roomAvailability.innerHTML = "<p>Select a building or room to view details</p>";
    });
  }
});