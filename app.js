const http = require('http');
const express = require('express');
const mongoose = require('mongoose'); 
require('dotenv').config();

const app = express();
app.use(express.json());

const server = http.createServer(app);
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});


const uri = process.env.MONGO_URI; 
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Successfully Connected to MongoDB ...'))
    .catch((error) => {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1);
    });


const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true }
});

const Item = mongoose.model('Item', itemSchema);


app.get('/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);        
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve items' });
    }
});


app.post('/items', async (req, res) => {
    const { name, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    try {
        const existingItem = await Item.findOne({ name });
        if (existingItem) {
            return res.status(400).json({ message: 'Item already exists' });
        }

        const newItem = new Item({ name, price });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create item' });
    }
});


app.put('/items/:id', async (req, res) => {
    const { name, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, { name, price }, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update item' });
    }
});


app.delete('/items/:id', async (req, res) => {
    try {
        const result = await Item.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(204).json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete item' });
    }
});


app.get('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve item' });
    }
});
