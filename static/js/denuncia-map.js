document.addEventListener("DOMContentLoaded", () => {
  const mapElement = document.getElementById("denunciaMap");
  const mobileMapWrapper = document.getElementById("mobileLocationMapWrapper");
  const mobileMapElement = document.getElementById("mobileLocationMap");
  const locationInput = document.getElementById("localManual");
  const latitudeInput = document.getElementById("latitudeDenuncia");
  const longitudeInput = document.getElementById("longitudeDenuncia");
  const statusElement = document.getElementById("statusLocalizacao");
  const currentLocationButton = document.getElementById("usarLocalizacaoAtual");

  if (!locationInput || typeof L === "undefined") {
    return;
  }

  const belemCenter = [-1.455833, -48.503887];
  const mobileQuery = window.matchMedia("(max-width: 900px)");
  let map = null;
  let mobileMap = null;
  let marker = null;
  let mobileMarker = null;
  let lastGeocodeTime = 0;
  const GEOCODE_DELAY = 500;

  const addTileLayer = (targetMap) => {
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    }).addTo(targetMap);
  };

  if (mapElement) {
    map = L.map(mapElement).setView(belemCenter, 13);
    addTileLayer(map);
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      if (!response.ok) throw new Error("Nominatim API error");

      const data = await response.json();
      if (data.address) {
        const address = data.address;
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

  const setMarker = (targetMap, latlng, isMobileMap) => {
    if (!targetMap) return;

    if (isMobileMap) {
      if (mobileMarker) {
        mobileMarker.setLatLng(latlng);
      } else {
        mobileMarker = L.marker(latlng).addTo(targetMap);
      }
      mobileMarker.bindPopup("Local selecionado para a denúncia").openPopup();
      return;
    }

    if (marker) {
      marker.setLatLng(latlng);
    } else {
      marker = L.marker(latlng).addTo(targetMap);
    }
    marker.bindPopup("Local selecionado para a denúncia").openPopup();
  };

  const updateLocation = async (latlng, targetMap, isMobileMap = false, message) => {
    const lat = latlng.lat.toFixed(6);
    const lng = latlng.lng.toFixed(6);

    if (latitudeInput && longitudeInput) {
      latitudeInput.value = lat;
      longitudeInput.value = lng;
    }

    setMarker(targetMap, latlng, isMobileMap);

    if (statusElement) {
      statusElement.textContent = "Convertendo coordenadas...";
    }

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
        locationInput.value = `${lat}, ${lng}`;
        if (statusElement) {
          statusElement.textContent = "Coordenadas capturadas (endereço indisponível).";
        }
      }
    }
    document.dispatchEvent(new Event("denuncia:location-updated"));
  };

  const initMobileMap = () => {
    if (mobileMap || !mobileMapElement) return mobileMap;

    mobileMap = L.map(mobileMapElement).setView(belemCenter, 13);
    addTileLayer(mobileMap);

    mobileMap.on("click", async (event) => {
      await updateLocation(event.latlng, mobileMap, true, "Localização selecionada no mapa.");
    });

    return mobileMap;
  };

  const showMobileMap = () => {
    if (!mobileQuery.matches || !mobileMapWrapper || !mobileMapElement) {
      return null;
    }

    mobileMapWrapper.classList.add("is-visible");
    const activeMap = initMobileMap();

    window.setTimeout(() => {
      activeMap.invalidateSize();
    }, 0);

    return activeMap;
  };

  if (map) {
    map.on("click", async (event) => {
      await updateLocation(event.latlng, map);
    });
  }

  if (currentLocationButton) {
    currentLocationButton.addEventListener("click", async () => {
      const targetMap = showMobileMap() || map;
      const isMobileMap = targetMap === mobileMap;

      if (!navigator.geolocation) {
        if (statusElement) {
          statusElement.textContent = isMobileMap
            ? "Geolocalização não disponível. Toque no mapa para selecionar."
            : "Geolocalização não disponível neste navegador.";
        }
        return;
      }

      if (statusElement) {
        statusElement.textContent = "Capturando localização atual...";
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
          if (targetMap) {
            targetMap.setView(latlng, 16);
          }
          await updateLocation(latlng, targetMap, isMobileMap, "Localização atual capturada.");
        },
        () => {
          if (statusElement) {
            statusElement.textContent = isMobileMap
              ? "Não foi possível capturar sua localização. Toque no mapa para selecionar."
              : "Não foi possível capturar sua localização.";
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
