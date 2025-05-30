const {
    Incident,
    INCIDENT_TYPES,
    INFESTATION_TYPES,
    DELITOS_ALTO_IMPACTO,
    DELITOS_BAJO_IMPACTO
} = require('../models/Incident');
const { calculateImpactLevel, generateStreetGeoJSON } = require('../utils/geoUtils');
const { fetchTlatelolcoStreets, getFallbackStreets } = require('../utils/tlatelolcoStreets');
const { geocodeAddress } = require('../utils/geocodingUtils');

// Create multiple incidents (bulk)
exports.createIncidentsBulk = async (req, res) => {
    try {
        console.log('Received request body:', JSON.stringify(req.body, null, 2));

        // Check if the request body is an array
        const incidents = Array.isArray(req.body) ? req.body : [req.body];
        console.log('Processing incidents:', incidents.length);

        const createdIncidents = [];

        for (const incidentData of incidents) {
            const {
                type,
                crimeType,
                date,
                time,
                location,
                description,
                reportedBy,
                contactInfo,
                additionalDetails
            } = incidentData;

            console.log('Validating incident type:', type);
            console.log('Available incident types:', Object.values(INCIDENT_TYPES));

            // Validar que el tipo de incidente sea válido
            if (!type || !Object.values(INCIDENT_TYPES).includes(type)) {
                console.log('Invalid incident type:', type);
                return res.status(400).json({
                    success: false,
                    error: 'El tipo de incidente es obligatorio y debe ser válido',
                });
            }

            // Validar que la fecha sea válida
            if (!date) {
                console.log('Missing date');
                return res.status(400).json({
                    success: false,
                    error: 'La fecha es obligatoria',
                });
            }

            // Ajustar la fecha a la zona horaria de Ciudad de México (UTC-6)
            let dateTime = new Date(date);
            // Ajustar la fecha para compensar la diferencia horaria
            dateTime.setHours(dateTime.getHours() + 6);

            if (time) {
                const [hours, minutes] = time.split(':');
                dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            }

            // Validar tipo de delito si es un crimen
            if (type === INCIDENT_TYPES.CRIME) {
                console.log('Validating crime type:', crimeType);
                console.log('Valid crime types:', [...DELITOS_ALTO_IMPACTO, ...DELITOS_BAJO_IMPACTO, 'Otro']);

                if (!crimeType) {
                    console.log('Missing crime type');
                    return res.status(400).json({
                        success: false,
                        error: 'El tipo de delito es obligatorio para incidentes de tipo crimen',
                    });
                }

                const validCrimeTypes = [...DELITOS_ALTO_IMPACTO, ...DELITOS_BAJO_IMPACTO, 'Otro'];
                if (!validCrimeTypes.includes(crimeType)) {
                    console.log('Invalid crime type:', crimeType);
                    return res.status(400).json({
                        success: false,
                        error: 'El tipo de delito especificado no es válido',
                    });
                }

                // Si es "Otro", validar la descripción adicional
                if (crimeType === 'Otro' && (!additionalDetails || !additionalDetails.otherTypeDescription)) {
                    console.log('Missing otherTypeDescription for crime type "Otro"');
                    return res.status(400).json({
                        success: false,
                        error: 'Para delitos de tipo "Otro", se requiere una descripción del tipo de delito',
                    });
                }
            }

            // Validar que la ubicación sea válida
            if (!location || !location.street) {
                console.log('Invalid location:', location);
                return res.status(400).json({
                    success: false,
                    error: 'La ubicación debe incluir al menos el nombre de la calle',
                });
            }

            // Si se proporcionan coordenadas, validar que sean correctas
            if (location.coordinates) {
                if (location.coordinates.lat && (location.coordinates.lat < -90 || location.coordinates.lat > 90)) {
                    return res.status(400).json({
                        success: false,
                        error: 'La latitud debe estar entre -90 y 90 grados',
                    });
                }
                if (location.coordinates.lng && (location.coordinates.lng < -180 || location.coordinates.lng > 180)) {
                    return res.status(400).json({
                        success: false,
                        error: 'La longitud debe estar entre -180 y 180 grados',
                    });
                }
            }

            // Si no se proporcionan coordenadas, intentar geocodificar la dirección
            if (!location.coordinates || !location.coordinates.lat || !location.coordinates.lng) {
                try {
                    const coordinates = await geocodeAddress(location.street, location.number || '');
                    location.coordinates = coordinates;
                } catch (error) {
                    console.error('Error al geocodificar la dirección:', error);
                    // No retornamos error aquí, ya que las coordenadas son opcionales
                }
            }

            // Validar que la descripción sea válida
            if (!description || description.trim().length < 10) {
                console.log('Invalid description:', description);
                return res.status(400).json({
                    success: false,
                    error: 'La descripción debe tener al menos 10 caracteres',
                });
            }

            // Validar que el reportante sea válido
            if (!reportedBy) {
                console.log('Missing reportedBy');
                return res.status(400).json({
                    success: false,
                    error: 'El nombre del reportante es obligatorio',
                });
            }

            // Validar el tipo de infestación si es necesario
            if (type === INCIDENT_TYPES.INFESTATION &&
                (!additionalDetails || !additionalDetails.infestationType ||
                    !Object.values(INFESTATION_TYPES).includes(additionalDetails.infestationType))) {
                return res.status(400).json({
                    success: false,
                    error: 'Para incidentes de infestación, se debe especificar el tipo (Ratas o Cucarachas)',
                });
            }

            console.log('Creating incident with data:', {
                type,
                crimeType,
                date,
                time,
                dateTime,
                location,
                description,
                reportedBy,
                contactInfo,
                additionalDetails
            });

            const incident = await Incident.create({
                type,
                crimeType: type === INCIDENT_TYPES.CRIME ? crimeType : undefined,
                date,
                time,
                dateTime,
                location,
                description,
                reportedBy,
                contactInfo: contactInfo || {},
                additionalDetails: additionalDetails || {},
            });

            console.log('Incident created successfully:', incident);
            createdIncidents.push(incident);
        }

        res.status(201).json({
            success: true,
            count: createdIncidents.length,
            data: createdIncidents,
        });
    } catch (error) {
        console.log('Error in createIncidentsBulk:', error);
        console.log('Error stack:', error.stack);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// Create single incident
exports.createIncident = async (req, res) => {
    try {
        const {
            type,
            crimeType,
            date,
            time,
            location,
            description,
            reportedBy,
            contactInfo,
            additionalDetails
        } = req.body;

        // Validar que el tipo de incidente sea válido
        if (!type || !Object.values(INCIDENT_TYPES).includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'El tipo de incidente es obligatorio y debe ser válido',
            });
        }

        // Validar que la fecha sea válida
        if (!date) {
            return res.status(400).json({
                success: false,
                error: 'La fecha es obligatoria',
            });
        }

        // Ajustar la fecha a la zona horaria de Ciudad de México (UTC-6)
        let dateTime = new Date(date);
        // Ajustar la fecha para compensar la diferencia horaria
        dateTime.setHours(dateTime.getHours() + 6);

        if (time) {
            const [hours, minutes] = time.split(':');
            dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        }

        // Validar tipo de delito si es un crimen
        if (type === INCIDENT_TYPES.CRIME) {
            if (!crimeType) {
                return res.status(400).json({
                    success: false,
                    error: 'El tipo de delito es obligatorio para incidentes de tipo crimen',
                });
            }

            const validCrimeTypes = [...DELITOS_ALTO_IMPACTO, ...DELITOS_BAJO_IMPACTO, 'Otro'];
            if (!validCrimeTypes.includes(crimeType)) {
                return res.status(400).json({
                    success: false,
                    error: 'El tipo de delito especificado no es válido',
                });
            }

            if (crimeType === 'Otro' && (!additionalDetails || !additionalDetails.otherTypeDescription)) {
                return res.status(400).json({
                    success: false,
                    error: 'Para delitos de tipo "Otro", se requiere una descripción del tipo de delito',
                });
            }
        }

        // Validar que la ubicación sea válida
        if (!location || !location.street) {
            return res.status(400).json({
                success: false,
                error: 'La ubicación debe incluir al menos el nombre de la calle',
            });
        }

        // Si se proporcionan coordenadas, validar que sean correctas
        if (location.coordinates) {
            if (location.coordinates.lat && (location.coordinates.lat < -90 || location.coordinates.lat > 90)) {
                return res.status(400).json({
                    success: false,
                    error: 'La latitud debe estar entre -90 y 90 grados',
                });
            }
            if (location.coordinates.lng && (location.coordinates.lng < -180 || location.coordinates.lng > 180)) {
                return res.status(400).json({
                    success: false,
                    error: 'La longitud debe estar entre -180 y 180 grados',
                });
            }
        }

        // Si no se proporcionan coordenadas, intentar geocodificar la dirección
        if (!location.coordinates || !location.coordinates.lat || !location.coordinates.lng) {
            try {
                const coordinates = await geocodeAddress(location.street, location.number || '');
                location.coordinates = coordinates;
            } catch (error) {
                console.error('Error al geocodificar la dirección:', error);
                // No retornamos error aquí, ya que las coordenadas son opcionales
            }
        }

        // Validar que la descripción sea válida
        if (!description || description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: 'La descripción debe tener al menos 10 caracteres',
            });
        }

        // Validar que el reportante sea válido
        if (!reportedBy) {
            return res.status(400).json({
                success: false,
                error: 'El nombre del reportante es obligatorio',
            });
        }

        const incident = await Incident.create({
            type,
            crimeType: type === INCIDENT_TYPES.CRIME ? crimeType : undefined,
            date,
            time,
            dateTime,
            location,
            description,
            reportedBy,
            contactInfo: contactInfo || {},
            additionalDetails: additionalDetails || {},
        });

        res.status(201).json({
            success: true,
            data: incident,
        });
    } catch (error) {
        console.log('Error in createIncident:', error);
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// Update incident
exports.updateIncident = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validar que el incidente exista
        const existingIncident = await Incident.findById(id);
        if (!existingIncident) {
            return res.status(404).json({
                success: false,
                error: 'Incidente no encontrado',
            });
        }

        // Validar tipo de incidente si se está actualizando
        if (updateData.type && !Object.values(INCIDENT_TYPES).includes(updateData.type)) {
            return res.status(400).json({
                success: false,
                error: 'El tipo de incidente no es válido',
            });
        }

        // Validar tipo de delito si se está actualizando
        if (updateData.crimeType) {
            const validCrimeTypes = [...DELITOS_ALTO_IMPACTO, ...DELITOS_BAJO_IMPACTO, 'Otro'];
            if (!validCrimeTypes.includes(updateData.crimeType)) {
                return res.status(400).json({
                    success: false,
                    error: 'El tipo de delito especificado no es válido',
                });
            }

            if (updateData.crimeType === 'Otro' && (!updateData.additionalDetails || !updateData.additionalDetails.otherTypeDescription)) {
                return res.status(400).json({
                    success: false,
                    error: 'Para delitos de tipo "Otro", se requiere una descripción del tipo de delito',
                });
            }
        }

        // Validar descripción si se está actualizando
        if (updateData.description && updateData.description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: 'La descripción debe tener al menos 10 caracteres',
            });
        }

        const updatedIncident = await Incident.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedIncident,
        });
    } catch (error) {
        console.log('Error in updateIncident:', error);
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// Delete incident
exports.deleteIncident = async (req, res) => {
    try {
        const { id } = req.params;

        const incident = await Incident.findByIdAndDelete(id);
        if (!incident) {
            return res.status(404).json({
                success: false,
                error: 'Incidente no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'Incidente eliminado correctamente',
        });
    } catch (error) {
        console.log('Error in deleteIncident:', error);
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// Get all incidents
exports.getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find().sort({ dateTime: -1 });

        // Ajustar las fechas a la zona horaria local antes de enviar la respuesta
        const adjustedIncidents = incidents.map(incident => {
            const incidentObj = incident.toObject();
            if (incidentObj.date) {
                const date = new Date(incidentObj.date);
                date.setHours(date.getHours() + 6);
                incidentObj.date = date;
            }
            if (incidentObj.dateTime) {
                const dateTime = new Date(incidentObj.dateTime);
                dateTime.setHours(dateTime.getHours() + 6);
                incidentObj.dateTime = dateTime;
            }
            return incidentObj;
        });

        res.status(200).json({
            success: true,
            count: incidents.length,
            data: adjustedIncidents,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// Get incidents by street
exports.getIncidentsByStreet = async (req, res) => {
    try {
        const { street } = req.params;
        const incidents = await Incident.find({ 'location.street': street });

        // Calculate impact level based on number of incidents
        const impactLevel = calculateImpactLevel(incidents);

        res.status(200).json({
            success: true,
            count: incidents.length,
            impactLevel,
            data: incidents,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// Get incident statistics
exports.getStatistics = async (req, res) => {
    try {
        const stats = await Incident.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    byStreet: {
                        $push: {
                            street: '$location.street',
                            severity: '$additionalDetails.severity'
                        }
                    }
                }
            },
            {
                $project: {
                    type: '$_id',
                    count: 1,
                    byStreet: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// Get GeoJSON data for map
exports.getMapData = async (req, res) => {
    try {
        // Get all incidents
        const incidents = await Incident.find();

        // Group incidents by street
        const incidentsByStreet = {};
        incidents.forEach(incident => {
            const street = incident.location.street;
            if (!incidentsByStreet[street]) {
                incidentsByStreet[street] = [];
            }
            incidentsByStreet[street].push(incident);
        });

        // Get street data from OpenStreetMap
        let tlatelolcoStreets;
        try {
            tlatelolcoStreets = await fetchTlatelolcoStreets();
        } catch (error) {
            console.error('Error fetching streets from OpenStreetMap:', error);
            tlatelolcoStreets = getFallbackStreets();
        }

        // Generate GeoJSON features for each street
        const features = [];

        // Add streets with incidents
        Object.keys(incidentsByStreet).forEach(street => {
            if (tlatelolcoStreets[street]) {
                const streetData = tlatelolcoStreets[street];
                const feature = generateStreetGeoJSON(
                    street,
                    incidentsByStreet[street],
                    streetData.coordinates
                );
                features.push(feature);
            }
        });

        // Add streets without incidents (in green)
        Object.keys(tlatelolcoStreets).forEach(street => {
            if (!incidentsByStreet[street]) {
                const streetData = tlatelolcoStreets[street];
                const feature = generateStreetGeoJSON(
                    street,
                    [],
                    streetData.coordinates
                );
                features.push(feature);
            }
        });

        // Create GeoJSON object
        const geoJSON = {
            type: 'FeatureCollection',
            features
        };

        // Debug: Log the GeoJSON data
        console.log('GeoJSON data being sent to frontend:', JSON.stringify(geoJSON, null, 2));

        res.status(200).json(geoJSON);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}; 