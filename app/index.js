const express = require('express');
const path = require('path');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const app = express();
const port = process.env.PORT || 8000;

if (process.env.NODE_ENV === 'development') {
    const cors = require('cors');
    app.use(cors({ origin: '*' }));
}

if (process.env.BASIC_AUTH_USERNAME && process.env.BASIC_AUTH_PASSWORD) {
    const basicAuth = require('express-basic-auth')
    app.use(basicAuth({
        users: { [process.env.BASIC_AUTH_USERNAME]: process.env.BASIC_AUTH_PASSWORD },
        challenge: true
    }));
}

app.get('/api/containers/:id/logs', async (req, res) => {
    const containerId = req.params.id;
    try {
        const container = docker.getContainer(containerId);
        const stream = await container.logs({
            follow: true,
            stdout: true,
            stderr: true,
            tail: 100
        });

        const isTty = (await container.inspect()).Config.Tty;

        if (isTty) {
            stream.on('data', (data) => {
                res.write(data.toString());
            });

            req.on('close', () => {
                stream.destroy();
            });
        } else {
            const stdoutStream = new require('stream').PassThrough();
            const stderrStream = new require('stream').PassThrough();

            docker.modem.demuxStream(stream, stdoutStream, stderrStream);

            stdoutStream.on('data', (data) => {
                res.write(data.toString());
            });

            stderrStream.on('data', (data) => {
                res.write(data.toString());
            });

            req.on('close', () => {
                stdoutStream.destroy();
                stderrStream.destroy();
            });
        }

        stream.on('end', () => {
            res.end();
        });
    } catch (err) {
        console.error(err);
        res.status(404).send('Container not found');
    }
});

app.get('/api/containers', async (req, res) => {
    try {
        const containers = await docker.listContainers({ all: true });
        const containerDetails = await Promise.all(containers.map(async containerInfo => {
            const container = docker.getContainer(containerInfo.Id);
            const details = await container.inspect();
            const healthStatus = details.State.Health ? details.State.Health.Status : null;

            return {
                id: containerInfo.Id,
                name: containerInfo.Names[0].replace(/^\//, ''),
                status: containerInfo.State,
                health: healthStatus,
                image: containerInfo.Image,
                tty: details.Config.Tty
            };
        }));

        res.json(containerDetails);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to list containers');
    }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Logsea is running on port ${port}`);
});
