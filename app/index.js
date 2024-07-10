const express = require('express');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const cors = require('cors');
const app = express();
const port = 8000;

app.use(cors({ origin: '*' }));

app.get('/containers/:id/logs', async (req, res) => {
    const containerId = req.params.id;
    try {
        const container = docker.getContainer(containerId);
        const stream = await container.logs({
            follow: true,
            stdout: true,
            stderr: true,
            tail: 100
        });

        stream.on('data', (data) => {
            res.write(data.toString());
        });
        stream.on('end', () => {
            res.end();
        });

        req.on('close', () => {
            stream.destroy();
        });
    } catch (err) {
        console.error(err);
        res.status(404).send('Container not found');
    }
});

app.get('/containers', async (req, res) => {
    try {
        const containers = await docker.listContainers({ all: true });
        const formattedContainers = containers.map(container => {
            return {
                id: container.Id,
                name: container.Names[0].replace(/^\//, ''),
                status: container.State,
                image: container.Image,
                ports: container.Ports.map(port => {
                    return {
                        IP: port.IP,
                        PrivatePort: port.PrivatePort,
                        PublicPort: port.PublicPort,
                        Type: port.Type
                    };
                })
            };
        });
        res.json(formattedContainers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to list containers');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
