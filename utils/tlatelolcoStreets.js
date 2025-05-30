const axios = require('axios');

// Función para obtener los datos de las calles de Tlatelolco desde OpenStreetMap
const fetchTlatelolcoStreets = async () => {
  try {
    const tlatelolcoCenter = {
      lat: 19.4500,
      lng: -99.1400
    };

    const radius = 1000;

    const query = `
      [out:json][timeout:25];
      (
        way["highway"]["name"](around:${radius},${tlatelolcoCenter.lat},${tlatelolcoCenter.lng});
        relation["highway"]["name"](around:${radius},${tlatelolcoCenter.lat},${tlatelolcoCenter.lng});
      );
      out body;
      >;
      out skel qt;
    `;

    // Overpass API requires URL-encoded body with `data=...`
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const elements = response.data.elements;
    if (!Array.isArray(elements)) {
      throw new Error('La respuesta de Overpass no contiene elementos válidos.');
    }

    const nodesMap = {};
    const streets = {};

    // Construye un mapa rápido de nodos para búsqueda por ID
    for (const el of elements) {
      if (el.type === 'node') {
        nodesMap[el.id] = [parseFloat(el.lat), parseFloat(el.lon)];
      }
    }

    // Procesa los ways
    for (const el of elements) {
      if (el.type === 'way' && el.tags && el.tags.name) {
        const coords = el.nodes
          .map(nodeId => nodesMap[nodeId])
          .filter(coord => Array.isArray(coord) && coord.length === 2);

        if (coords.length > 0) {
          streets[el.tags.name] = {
            coordinates: [coords]
          };
        }
      }
    }

    return streets;
  } catch (error) {
    console.error('Error al obtener datos de OpenStreetMap:', error.message);
    return getFallbackStreets();
  }
};

// Datos de ejemplo para usar en caso de error
const getFallbackStreets = () => {
  return {
    "Av. Ricardo Flores Magón": {
      coordinates: [
        [
          [19.4500, -99.1400],
          [19.4510, -99.1390],
          [19.4520, -99.1380]
        ]
      ]
    },
    "Av. Manuel González": {
      coordinates: [
        [
          [19.4490, -99.1410],
          [19.4500, -99.1400],
          [19.4510, -99.1390]
        ]
      ]
    },
    "Av. Insurgentes Norte": {
      coordinates: [
        [
          [19.4480, -99.1420],
          [19.4490, -99.1410],
          [19.4500, -99.1400]
        ]
      ]
    }
  };
};

module.exports = {
  fetchTlatelolcoStreets,
  getFallbackStreets
};
