const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

app.use(cors({
    origin: 'http://localhost:8100'
}));

const port = process.env.PORT || 8080;
const uri = "mongodb+srv://aaronblac:CSk029cwTPUtmOBr@clustergroceries.aiood9j.mongodb.net/Groceries";

// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }
    console.log('Connected to MongoDB');

    const db = client.db();
    const itemCollection = db.collection('items');

    // Get Items
    app.get('/api/items', async (req, res) => {
        try {
            const items = await itemCollection.find().toArray();
            res.json(items);
        } catch (err) {
            res.status(500).send(err);
        }
    });

    // Add Items
    app.post('/api/items', async (req, res) => {
        const newItem = req.body;
        console.log('before logic', newItem);
        try {
            const addedItem = await itemCollection.insertOne(newItem);
            console.log('added item before res.json');
            res.json(addedItem.ops[0]);
            console.log('added item after res.json');
            return;
        } catch (err) {
            res.status(400).send(err);
        }
        
        console.log('after logic', newItem);
    });

    // Update Items
    app.put('/api/items/:id', async (req, res) => {
        console.log('put call', req.params.id);
        console.log('req.body', req.body)
        const id = req.params.id;
        console.log('object id', id)
        try {
            const { name, quantity } = req.body;
            req.body = {
                $set: {
                    name,
                    quantity
                }
            };
            const updatedItem = await itemCollection.updateOne(
                { _id: ObjectId(id) }, // Match document by _id
                req.body // Pass req.body containing valid update operators
            );
            console.log(updatedItem.matchedCount);
            if (updatedItem.matchedCount === 0) return res.status(404).send('Item not found');
            const updatedDocument = await itemCollection.findOne({ _id: ObjectId(id) });
        
            if (!updatedDocument) {
                return res.status(404).send('Updated item not found');
            }

            res.json(updatedDocument);
        } catch (error) {
            console.error('error during update', error)
            res.status(400).send(err);
        }
    });

    // Delete Items
    app.delete('/api/items/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const deletedItem = await itemCollection.deleteOne({ _id: ObjectId(id) });
            if (deletedItem.matchedCount === 0) return res.status(404).send('Item not found');
            const updatedDocument = await itemCollection.findOne({ _id: ObjectId(id) });
            res.json(updatedDocument);
        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.listen(port, () => console.log(`Server listening on port ${port}`));
});
