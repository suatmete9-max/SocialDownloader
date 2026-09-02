const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Video Info Fetcher Route
app.post('/api/fetch-info', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    try {
        const response = await axios.post('https://co.wuk.sh/api/json', {
            url: url,
            vQuality: 'max'
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;
        if (data.url || data.picker) {
            return res.json({
                status: 'success',
                title: 'Social Media Video Clip',
                downloadUrl: data.url || (data.picker && data.picker[0].url),
                picker: data.picker || []
            });
        }
        res.status(400).json({ error: 'Video fetch failed' });
    } catch (err) {
        res.status(500).json({ error: 'Server error processing request' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));