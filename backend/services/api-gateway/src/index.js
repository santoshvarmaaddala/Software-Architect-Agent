const express = require("express");
const bodyParser = require("body-parser");
const {createChannelWithRetry} = require("./rabbitmq");
const createRoutes = require("./router");
const cors = require('cors');


const app = express();

app.use(cors())

app.use(bodyParser.json())

const IN_QUEUE = process.env.IN_QUEUE || 'requirement.submitted';

async function start() {
    const channel = await createChannelWithRetry(IN_QUEUE);

    const routes = createRoutes(channel, IN_QUEUE);

    app.use("/api", routes);

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
         console.log(`API Gateway listening on port ${PORT}`);
    })
}


start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});