document.addEventListener("DOMContentLoaded", () => {
  const mapElement = document.getElementById("denunciaMap");
  const locationInput = document.getElementById("localManual");
  const statusElement = document.getElementById("statusLocalizacao");
  const currentLocationButton = document.getElementById("usarLocalizacaoAtual");

  if (!mapElement || !locationInput || typeof L === "undefined") {
    return;
  }

  const belemCenter = [-1.455833, -48.503887];
  const map = L.map(mapElement).setView(belemCenter, 13);
  let marker = null;

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  }).addTo(map);

  const updateLocation = (latlng, message) => {
    const lat = latlng.lat.toFixed(6);
    const lng = latlng.lng.toFixed(6);

    locationInput.value = `${lat}, ${lng}`;

    if (marker) {
      marker.setLatLng(latlng);
    } else {
      marker = L.marker(latlng).addTo(map);
    }

    marker.bindPopup("Local selecionado para a denúncia").openPopup();

    if (statusElement) {
      statusElement.textContent = message || "Localização selecionada no mapa.";
    }
  };

  map.on("click", (event) => {
    updateLocation(event.latlng);
  });

  if (currentLocationButton) {
    currentLocationButton.addEventListener("click", () => {
      if (!navigator.geolocation) {
        if (statusElement) {
          statusElement.textContent = "Geolocalização não disponível neste navegador.";
        }
        return;
      }

      if (statusElement) {
        statusElement.textContent = "Capturando localização atual...";
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
          map.setView(latlng, 16);
          updateLocation(latlng, "Localização atual capturada.");
        },
        () => {
          if (statusElement) {
            statusElement.textContent = "Não foi possível capturar sua localização.";
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }
});
