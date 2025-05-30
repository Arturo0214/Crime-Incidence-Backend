const mongoose = require('mongoose');

const DELITOS_ALTO_IMPACTO = [
    'Homicidio',
    'Feminicidio',
    'Secuestro',
    'Extorsión',
    'Robo con violencia',
    'Robo de vehículo con violencia',
    'Robo a casa habitación con violencia',
    'Robo a negocio con violencia',
    'Violación',
    'Trata de personas',
    'Robo a transeunte en la vía pública con violencia',
    'Lesiones dolosas por disparo de arma de fuego',
    'Robo a transeunte en la vía pública sin violencia',
    'Robo a pasajero a bordo de metro con violencia',
    'Robo a repartidor con y sin violencia',
    'Robo a pasajero a bordo de taxi con violencia',
    'Robo a transportista con o sin violencia',
    'Robo a pasajero a bordo de microbús con y sin violencia',
    'Daño a propiedad culposo',
    'Despojo',
    'Allanamiento de domicilio'
];

const DELITOS_BAJO_IMPACTO = [
    'Robo sin violencia',
    'Robo de vehículo sin violencia',
    'Robo a casa habitación sin violencia',
    'Robo a negocio sin violencia',
    'Acoso en la vía pública',
    'Fraude',
    'Falsificación de documentos',
    'Lesiones menores (sin hospitalización)',
    'Quejas por ruido',
    'Vandalismo',
    'Violencia familiar',
    'Posesión de drogas para consumo personal',
    'Amenazas',
    'Robo a pasajero a bordo de metro sin violencia',
    'Robo de autopartes',
    'Falsificación de documentos',
    'Otro'
];

const INCIDENT_TYPES = {
    CRIME: 'Crimen',
    TREE_TRIMMING: 'Poda de árboles',
    HOMELESS: 'Personas en situación de calle',
    MOTORCYCLE_TRAFFIC: 'Tránsito de motocicletas',
    AUTO_PARTS_THEFT: 'Robo de autopartes',
    LIGHTING: 'Iluminación',
    INFESTATION: 'Infestación',
    CAMERAS: 'Cámaras',
    CITIZEN_PETITION: 'Petición ciudadana',
    OTHER: 'Otro'
};

const INFESTATION_TYPES = {
    RATS: 'Ratas',
    COCKROACHES: 'Cucarachas'
};

const incidentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: Object.values(INCIDENT_TYPES),
    },
    crimeType: {
        type: String,
        required: function () {
            return this.type === INCIDENT_TYPES.CRIME;
        },
        enum: [...DELITOS_ALTO_IMPACTO, ...DELITOS_BAJO_IMPACTO, 'Otro'],
    },
    crimeImpact: {
        type: String,
        enum: ['ALTO', 'BAJO'],
        required: function () {
            return this.type === INCIDENT_TYPES.CRIME && this.crimeType !== 'Otro';
        }
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: false,
        validate: {
            validator: function (v) {
                if (!v) return true; // Permitir que sea opcional
                // Validar formato HH:mm (24 horas)
                return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: props => `${props.value} no es un formato de hora válido. Use HH:mm (24 horas)`
        }
    },
    dateTime: {
        type: Date,
        required: true
    },
    location: {
        street: {
            type: String,
            required: true,
        },
        coordinates: {
            lat: {
                type: Number,
                required: false
            },
            lng: {
                type: Number,
                required: false
            }
        },
        additionalInfo: {
            type: String,
            required: false
        }
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    status: {
        type: String,
        enum: ['reportado', 'en investigación', 'resuelto', 'archivado'],
        default: 'reportado',
    },
    reportedBy: {
        type: String,
        required: true,
    },
    contactInfo: {
        phone: String,
        email: String,
    },
    additionalDetails: {
        infestationType: {
            type: String,
            enum: Object.values(INFESTATION_TYPES),
            required: function () {
                return this.type === INCIDENT_TYPES.INFESTATION;
            }
        },
        severity: {
            type: String,
            enum: ['baja', 'media', 'alta'],
            required: false
        },
        images: [{
            url: String,
            description: String
        }],
        notes: String,
        otherTypeDescription: {
            type: String,
            required: function () {
                return this.type === INCIDENT_TYPES.CRIME && this.crimeType === 'Otro';
            }
        }
    }
}, {
    timestamps: true,
});

// Middleware para determinar automáticamente el nivel de impacto del delito
incidentSchema.pre('validate', function (next) {
    if (this.type === INCIDENT_TYPES.CRIME && this.crimeType !== 'Otro') {
        if (DELITOS_ALTO_IMPACTO.includes(this.crimeType)) {
            this.crimeImpact = 'ALTO';
        } else if (DELITOS_BAJO_IMPACTO.includes(this.crimeType)) {
            this.crimeImpact = 'BAJO';
        }
    }

    // Combinar fecha y hora en dateTime
    if (this.date && this.time) {
        const [hours, minutes] = this.time.split(':');
        const dateTime = new Date(this.date);
        dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        this.dateTime = dateTime;
    } else if (this.date) {
        this.dateTime = new Date(this.date);
    }

    next();
});

// Index for efficient querying
incidentSchema.index({ 'location.street': 1 });
incidentSchema.index({ dateTime: -1 });
incidentSchema.index({ type: 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ crimeType: 1 });
incidentSchema.index({ crimeImpact: 1 });

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = {
    Incident,
    INCIDENT_TYPES,
    INFESTATION_TYPES,
    DELITOS_ALTO_IMPACTO,
    DELITOS_BAJO_IMPACTO
}; 