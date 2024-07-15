# 🌊 Logsea

See logs from your Docker containers 🐳 using just your web browser, from anywhere.

That's all there is to it. ✨

## Usage

Logsea is packaged as a Docker image that you can just pull and run.

```sh
docker run -d \
  -p 8000:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  dusanlazic/logsea
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

## Access Control (HTTP Basic Auth)

Anyone with access to your Logsea instance can view basic container information and read the container logs. If your Logsea instance is running on a shared network or if it's publicly reachable, set a username and password to enable HTTP Basic Authentication.

To configure HTTP Basic Auth, set the `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` environment variables.

### Shell

```sh
docker run -d \
  -p 8000:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e BASIC_AUTH_USERNAME=user \
  -e BASIC_AUTH_PASSWORD=pass \
  dusanlazic/logsea
```

### Compose

```yaml
services:
  logsea:
    image: dusanlazic/logsea
    ports:
      - "8000:8000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      BASIC_AUTH_USERNAME: user
      BASIC_AUTH_PASSWORD: pass
```

## Future Enhancements

- [x] Access control
- [ ] Bug fixes and robust error handling
- [ ] Slight UI/UX improvements