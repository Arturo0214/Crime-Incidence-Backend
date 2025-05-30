const axios = require('axios');

// Función para geocodificar una dirección
exports.geocodeAddress = async (address) => {
    try {
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
            params: {
                q: address,
                key: process.env.OPENCAGE_API_KEY,
                limit: 1
            }
        });

        if (response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry;
            return { lat, lng };
        }
        return null;
    } catch (error) {
        console.error('Error en geocodificación:', error);
        return null;
    }
};

/**
 * Calcula el nivel de impacto basado en el número de incidentes
 * @param {Array} incidents - Array de incidentes
 * @returns {String} - Nivel de impacto (GREEN, YELLOW, RED)
 */
const calculateImpactLevel = (incidents) => {
    const count = incidents.length;

    if (count < 3) {
        return 'GREEN';
    } else if (count < 7) {
        return 'YELLOW';
    } else {
        return 'RED';
    }
};

// Función para obtener el color basado en el nivel de impacto
exports.getImpactColor = (impactLevel) => {
    const colors = {
        GREEN: '#4CAF50',
        YELLOW: '#FFC107',
        RED: '#F44336'
    };
    return colors[impactLevel] || colors.GREEN;
};

// Función para agrupar incidentes por calle
exports.groupIncidentsByStreet = (incidents) => {
    return incidents.reduce((acc, incident) => {
        const street = incident.location.street;
        if (!acc[street]) {
            acc[street] = [];
        }
        acc[street].push(incident);
        return acc;
    }, {});
};

/**
 * Genera un objeto GeoJSON para una calle con sus incidentes
 * @param {String} streetName - Nombre de la calle
 * @param {Array} incidents - Array de incidentes en la calle
 * @param {Array} coordinates - Coordenadas de la calle
 * @returns {Object} - Objeto GeoJSON
 */
const generateStreetGeoJSON = (streetName, incidents, coordinates) => {
    // Calcular el nivel de impacto
    const impactLevel = calculateImpactLevel(incidents);

    // Determinar el color basado en el nivel de impacto
    let color;
    switch (impactLevel) {
        case 'GREEN':
            color = '#4CAF50'; // Verde
            break;
        case 'YELLOW':
            color = '#FFC107'; // Amarillo
            break;
        case 'RED':
            color = '#F44336'; // Rojo
            break;
        default:
            color = '#4CAF50'; // Verde por defecto
    }

    // Contar incidentes por tipo de impacto
    const highImpact = incidents.filter(incident => incident.impactLevel === 'HIGH').length;
    const lowImpact = incidents.filter(incident => incident.impactLevel === 'LOW').length;

    // Asegurarse de que las coordenadas estén en el formato correcto para Leaflet
    // Leaflet espera coordenadas en formato [latitud, longitud]
    let formattedCoordinates = [];

    // Función para limpiar y formatear coordenadas
    const cleanCoordinates = (coords) => {
        if (!Array.isArray(coords)) return [];

        // Si es un array de arrays (para una línea)
        if (coords.length > 0 && Array.isArray(coords[0])) {
            // Verificar si el primer elemento es un array (para múltiples líneas)
            if (Array.isArray(coords[0][0])) {
                // Es un array de arrays de arrays (para múltiples líneas)
                return coords.map(line => {
                    return line.map(coord => {
                        // Asegurarse de que cada coordenada sea [lat, lng]
                        if (Array.isArray(coord) && coord.length >= 2) {
                            // Las coordenadas ya están en formato [lat, lng]
                            return [parseFloat(coord[0]), parseFloat(coord[1])];
                        }
                        return null;
                    }).filter(coord => coord !== null);
                });
            } else {
                // Es un array de arrays (para una línea)
                return coords.map(coord => {
                    // Asegurarse de que cada coordenada sea [lat, lng]
                    if (Array.isArray(coord) && coord.length >= 2) {
                        // Las coordenadas ya están en formato [lat, lng]
                        return [parseFloat(coord[0]), parseFloat(coord[1])];
                    }
                    return null;
                }).filter(coord => coord !== null);
            }
        } else if (coords.length === 4) {
            // Si es un array de 4 elementos, probablemente es [lat1, lng1, lat2, lng2]
            // Convertirlo a formato [[lat1, lng1], [lat2, lng2]]
            return [
                [parseFloat(coords[0]), parseFloat(coords[1])],
                [parseFloat(coords[2]), parseFloat(coords[3])]
            ];
        } else {
            // Es un array simple (para un punto)
            return coords.length >= 2 ? [parseFloat(coords[0]), parseFloat(coords[1])] : null;
        }
    };

    // Limpiar y formatear las coordenadas
    formattedCoordinates = cleanCoordinates(coordinates);

    // Crear el objeto GeoJSON
    return {
        type: 'Feature',
        properties: {
            name: streetName,
            count: incidents.length,
            highImpact,
            lowImpact,
            color,
            impactLevel
        },
        geometry: {
            type: 'LineString',
            coordinates: formattedCoordinates
        }
    };
};

module.exports = {
    calculateImpactLevel,
    generateStreetGeoJSON
}; 