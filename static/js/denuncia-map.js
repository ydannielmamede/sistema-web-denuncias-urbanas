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
  let lastGeocodeTime = 0;
  const GEOCODE_DELAY = 500; // ms

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  }).addTo(map);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: { "User-Agent": "DenunciasUrbanasApp/1.0" },
        }
      );

      if (!response.ok) throw new Error("Nominatim API error");

      const data = await response.json();
      if (data.address) {
        const address = data.address;
        // Formatar endereço: rua + número + bairro + cidade
        const parts = [];
        if (address.road) parts.push(address.road);
        if (address.house_number) parts.push(address.house_number);
        if (address.suburb) parts.push(address.suburb);
        if (address.city) parts.push(address.city);
        if (address.postcode) parts.push(address.postcode);
        if (address.country) parts.push(address.country);
        return parts.filter(Boolean).join(", ");
      }
      return null;
    } catch (error) {
      console.error("Geocodificação reversa falhou:", error);
      return null;
    }
  };

  const updateLocation = async (latlng, message) => {
    const lat = latlng.lat.toFixed(6);
    const lng = latlng.lng.toFixed(6);

    if (statusElement) {
      statusElement.textContent = "Convertendo coordenadas...";
    }

    // Throttling: evitar múltiplas requisições
    const now = Date.now();
    if (now - lastGeocodeTime < GEOCODE_DELAY) {
      locationInput.value = `${lat}, ${lng}`;
      if (statusElement) {
        statusElement.textContent = message || "Localização selecionada no mapa.";
      }
    } else {
      lastGeocodeTime = now;

      const address = await reverseGeocode(lat, lng);
      if (address) {
        locationInput.value = address;
        if (statusElement) {
          statusElement.textContent = `Localização: ${address}`;
        }
      } else {
        // Fallback: usar coordenadas se Nominatim falhar
        locationInput.value = `${lat}, ${lng}`;
        if (statusElement) {
          statusElement.textContent = "Coordenadas capturadas (endereço indisponível).";
        }
      }
    }

    if (marker) {
      marker.setLatLng(latlng);
    } else {
      marker = L.marker(latlng).addTo(map);
    }

    marker.bindPopup("Local selecionado para a denúncia").openPopup();
  };

  map.on("click", async (event) => {
    await updateLocation(event.latlng);
  });

  if (currentLocationButton) {
    currentLocationButton.addEventListener("click", async () => {
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
        async (position) => {
          const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
          map.setView(latlng, 16);
          await updateLocation(latlng, "Localização atual capturada.");
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
