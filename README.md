# 🌊 Logsea

See logs from your Docker containers 🐳 using just your web browser, from anywhere.

That's all there is to it. ✨

## Usage

Logsea is packaged as a Docker image that you can just pull and run.

```sh
docker run -d -p 8000:8000 -v /var/run/docker.sock:/var/run/docker.sock dusanlazic/logsea
```

If you are using Docker Compose, you can add Logsea alongside your other containers in your compose.yaml.

```yaml
services:
  logsea:
    image: dusanlazic/logsea
    ports:
      - "8000:8000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

After you've got it set up, just navigate to http://localhost:8000 in your web browser and you’ll find all your containers and logs there. 🚀

## Security Considerations

Logsea does not implement any form of authroization and access control (yet). Anyone who can reach your Logsea instance will be able to view some basic information and logs of the containers on your machine! ⚠️

## Future Enhancements

- [ ] Access control
- [ ] Bug fixes and robust error handling
- [ ] Slight UI/UX improvements