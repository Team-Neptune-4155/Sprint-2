document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const toggleButton = document.getElementById("toggle-panel");
  const sidePanel = document.getElementById("side-panel");
  const zoomInButton = document.getElementById("zoom-in");
  const zoomOutButton = document.getElementById("zoom-out");
  const resetButton = document.getElementById("reset-button");
  const svg = document.querySelector("svg");
  const mapContainer = document.querySelector(".map-container");
  
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

  // Helper function for side panel
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

  // Show rooms for a specific building and return them
  function showRoomsForBuilding(buildingId) {
    const rooms = document.querySelectorAll(`.room.${buildingId}`);
    rooms.forEach(room => {
      room.classList.add("visible");
    });
    return rooms;
  }

  // Hide all rooms
  function hideAllRooms() {
    const rooms = document.querySelectorAll(".room");
    rooms.forEach(room => {
      room.classList.remove("visible");
    });
  }

  // Simplified room click handler
  function setupRoomClickHandlers() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("room") && e.target.classList.contains("visible")) {
        openSidePanel();
      }
    });
  }

<<<<<<< Updated upstream
  // Async function to fetch room data (will be replaced with database call later)
  async function fetchRoomData(buildingId) {
=======

  var room_Data = []
  initData();

  async function initData() {
    const response = await fetch("static/rooms.json");
    var check = await response.json();
    room_Data = check;
  }


  // Async function to fetch room data (will be replaced with database call later)
  async function fetchRoomData(buildingId) {

    await initData();

>>>>>>> Stashed changes
    const rooms = [];
    document.querySelectorAll(`.room.${buildingId}`).forEach(room => {
      const roomNumber = room.id.split('-').pop();
      rooms.push({
        id: room.id,
<<<<<<< Updated upstream
        number: roomNumber,
        status: "Available", // Defaults - will come from DB later
        capacity: getRoomCapacity(roomNumber),
        type: getRoomType(roomNumber),
=======
        number: room_Data[0][1],
        status: "Available", // Defaults - will come from DB later
        capacity: room_Data[0][3],
        type: room_Data[0][4],
>>>>>>> Stashed changes
        lastCleaned: getLastCleanedDate(roomNumber)
      });
    });
    return rooms;
  }

  // Main function to update building info and create accordions
  async function updateBuildingInfo(buildingId) {
    const accordion = document.getElementById('roomsAccordion');
    accordion.innerHTML = '<div class="accordion-item"><div class="accordion-body"><p>Loading rooms...</p></div></div>';
    
    try {
      const rooms = await fetchRoomData(buildingId);
      
      if (rooms.length === 0) {
        accordion.innerHTML = `
          <div class="accordion-item">
            <div class="accordion-body">
              <p>No rooms available in this building</p>
            </div>
          </div>
        `;
        return;
      }

      accordion.innerHTML = ''; // Clear loading message
      
      rooms.forEach(room => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        accordionItem.innerHTML = `
          <h2 class="accordion-header" id="heading${room.id}">
            <button class="accordion-button collapsed" type="button" 
                    data-bs-toggle="collapse" data-bs-target="#collapse${room.id}" 
                    aria-expanded="false" aria-controls="collapse${room.id}">
              Room ${room.number}
            </button>
          </h2>
          <div id="collapse${room.id}" class="accordion-collapse collapse" 
               aria-labelledby="heading${room.id}">
            <div class="accordion-body">
              <p>Status: ${room.status}</p>
              <p>Capacity: ${room.capacity}</p>
              <p>Type: ${room.type}</p>
              <p>Last cleaned: ${room.lastCleaned}</p>
            </div>
          </div>
        `;
        accordion.appendChild(accordionItem);
        
        // Link SVG room to accordion
        const svgRoom = document.getElementById(room.id);
        if (svgRoom) {
          svgRoom.addEventListener('click', (e) => {
            e.stopPropagation();
            openSidePanel();
            
            // Collapse all others, expand this one
            document.querySelectorAll('.accordion-collapse').forEach(collapse => {
              const bsCollapse = bootstrap.Collapse.getInstance(collapse);
              if (collapse.id !== `collapse${room.id}` && bsCollapse) {
                bsCollapse.hide();
              }
            });
            
            new bootstrap.Collapse(document.getElementById(`collapse${room.id}`), {
              toggle: true
            }).show();
          });
        }
      });
      
    } catch (error) {
      console.error("Failed to load room data:", error);
      accordion.innerHTML = `
        <div class="accordion-item">
          <div class="accordion-body">
            <p>Error loading room data</p>
          </div>
        </div>
      `;
    }
  }

  // Setup building click handlers
  function setupBuildingClickHandlers() {
    const buildings = document.querySelectorAll(".building");
    
    buildings.forEach(building => {
      building.addEventListener("click", async (e) => {
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
        await updateBuildingInfo(buildingId);
      });
    });
  }

  // Helper functions for room data - replace with your actual data source
  function getRoomCapacity(roomNumber) {
    const capacities = {
      '105': 30,
      '106': 45,
      '107': 20,
      '108': 60,
      '109': 25,
      '110': 40,
      '111': 35
    };
    return capacities[roomNumber] || 25;
  }

  function getRoomType(roomNumber) {
    const types = {
      '105': 'Classroom',
      '106': 'Lecture Hall',
      '107': 'Lab',
      '108': 'Conference Room',
      '109': 'Seminar Room',
      '110': 'Study Room',
      '111': 'Meeting Room'
    };
    return types[roomNumber] || 'Room';
  }

  function getLastCleanedDate(roomNumber) {
    const dates = {
      '105': 'Today',
      '106': 'Yesterday',
      '107': '2 days ago',
      '108': 'This week',
      '109': 'Today',
      '110': 'Yesterday',
      '111': 'This week'
    };
    return dates[roomNumber] || 'Recently';
  }

  // Setup reset button functionality
  function setupResetButton() {
    resetButton.style.display = "block";
    
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
      
      // Reset side panel to default state
      const accordion = document.getElementById('roomsAccordion');
      accordion.innerHTML = `
        <div class="accordion-item">
          <div class="accordion-body">
            <p>Select a building to view room details.</p>
          </div>
        </div>
      `;
    });
  }
});

document.querySelectorAll(".room").forEach(room => {
  room.classList.remove("visible");
});