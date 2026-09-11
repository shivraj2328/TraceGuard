const express = require('express');
const cors = require('cors');
const v1Routes = require('./src/routes/v1');

const app = express();

//middlewares
app.use(cors());
app.use(express.json());

//versioning
app.use('/api/v1', v1Routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));