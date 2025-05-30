const axios = require('axios');

/**
 * Geocodifica una dirección en Tlatelolco para obtener sus coordenadas
 * @param {string} street - Nombre de la calle
 * @param {string} number - Número de la calle (opcional)
 * @returns {Promise<{lat: number, lng: number}>} - Coordenadas geográficas
 */
const geocodeAddress = async (street, number = '') => {
    try {
        // Construir la dirección completa
        const address = `${street} ${number}, Tlatelolco, Ciudad de México, México`;

        // Usar Nominatim (OpenStreetMap) para geocodificación
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1,
                countrycodes: 'mx',
                'accept-language': 'es'
            },
            headers: {
                'User-Agent': 'TlatelolcoCrimeMap/1.0'
            }
        });

        if (response.data && response.data.length > 0) {
            // Nominatim devuelve lat y lon
            return {
                lat: parseFloat(response.data[0].lat),
                lng: parseFloat(response.data[0].lon)
            };
        }

        // Si no se encuentra la dirección específica, buscar solo la calle
        const streetOnlyResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: `${street}, Tlatelolco, Ciudad de México, México`,
                format: 'json',
                limit: 1,
                countrycodes: 'mx',
                'accept-language': 'es'
            },
            headers: {
                'User-Agent': 'TlatelolcoCrimeMap/1.0'
            }
        });

        if (streetOnlyResponse.data && streetOnlyResponse.data.length > 0) {
            return {
                lat: parseFloat(streetOnlyResponse.data[0].lat),
                lng: parseFloat(streetOnlyResponse.data[0].lon)
            };
        }

        // Si no se encuentra nada, devolver coordenadas por defecto de Tlatelolco
        console.warn(`No se pudo geocodificar la dirección: ${address}`);
        return {
            lat: 19.4500,
            lng: -99.1400
        };
    } catch (error) {
        console.error('Error en geocodificación:', error);
        // En caso de error, devolver coordenadas por defecto de Tlatelolco
        return {
            lat: 19.4500,
            lng: -99.1400
        };
    }
};

module.exports = {
    geocodeAddress
}; 