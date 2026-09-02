const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Public Cobalt API Instances for High Availability
const COBALT_INSTANCES = [
    'https://api.cobalt.tools/api/json',
    'https://co.wuk.sh/api/json',
    'https://cobalt.stream/api/json'
];

app.post('/api/fetch-info', async (req, res) => {
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    // Clean tracking query parameters (e.g. ?igsh=...) from URL
    url = url.split('?')[0];

    for (const instance of COBALT_INSTANCES) {
        try {
            const response = await axios.post(instance, {
                url: url
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                },
                timeout: 8000
            });

            const data = response.data;
            if (data && (data.url || data.picker)) {
                return res.json({
                    status: 'success',
                    downloadUrl: data.url || (data.picker && data.picker[0] && data.picker[0].url),
                    picker: data.picker || []
                });
            }
        } catch (err) {
            console.log(`Failed with instance: ${instance}, trying next...`);
        }
    }

    return res.status(500).json({ error: 'Unable to process video at this time. Please try another link.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
