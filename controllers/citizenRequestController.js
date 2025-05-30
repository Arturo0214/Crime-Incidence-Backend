const CitizenRequest = require('../models/CitizenRequest');

exports.getAll = async (req, res) => {
    try {
        const requests = await CitizenRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { title, description, requesterName, requesterPhone, street, longitude, latitude, status } = req.body;
        const request = new CitizenRequest({
            title,
            description,
            requester: {
                name: requesterName,
                phone: requesterPhone
            },
            location: {
                street,
                coordinates: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                }
            },
            status
        });
        await request.save();
        res.status(201).json(request);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, requesterName, requesterPhone, street, longitude, latitude, status } = req.body;
        const updateData = {
            title,
            description,
            requester: {
                name: requesterName,
                phone: requesterPhone
            },
            location: {
                street,
                coordinates: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                }
            },
            status
        };
        const request = await CitizenRequest.findByIdAndUpdate(id, updateData, { new: true });
        res.json(request);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const request = await CitizenRequest.findByIdAndUpdate(id, { status }, { new: true });
        res.json(request);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, author } = req.body;
        const request = await CitizenRequest.findById(id);
        if (!request) return res.status(404).json({ error: 'Not found' });
        request.comments.push({ text, author });
        await request.save();
        res.json(request);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await CitizenRequest.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getByLocation = async (req, res) => {
    try {
        const { longitude, latitude, radius } = req.query;
        const lng = parseFloat(longitude);
        const lat = parseFloat(latitude);
        const rad = parseFloat(radius) || 1000; // metros
        const requests = await CitizenRequest.find({
            'location.coordinates': {
                $near: {
                    $geometry: { type: 'Point', coordinates: [lng, lat] },
                    $maxDistance: rad
                }
            }
        });
        res.json(requests);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.editComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const { text } = req.body;
        const request = await CitizenRequest.findById(id);
        if (!request) return res.status(404).json({ error: 'Not found' });
        if (!request.comments[commentId]) return res.status(404).json({ error: 'Comment not found' });
        request.comments[commentId].text = text;
        await request.save();
        res.json(request);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const request = await CitizenRequest.findById(id);
        if (!request) return res.status(404).json({ error: 'Not found' });
        if (!request.comments[commentId]) return res.status(404).json({ error: 'Comment not found' });
        request.comments.splice(commentId, 1);
        await request.save();
        res.json(request);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}; 