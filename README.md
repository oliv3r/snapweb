# Snapweb

Web client for [Snapcast](https://github.com/badaix/snapcast), optimized for
mobile devices, with the look and feel of
[Snapdroid](https://github.com/badaix/snapdroid)

## Develop

1. Add your snapserver host as a local environment var
    ```bash
    echo 'VITE_APP_SNAPSERVER_HOST = localhost:1780' > .env.local
    ```
1. Install dependencies
    ```bash
    npm ci
    ```
1. Run local web server and watcher
    ```bash
    npm run dev
    ```

## Build for production

1. Install dependencies: `npm ci`
1. Build: `npm run build`
1. Copy the created `dest` directory to some path on your snapserver host and
   let the `[http] doc_root` in your `snapserver.conf` point to it
1. Restart `snapserver` and navigate with a browser to
   `http://<snapserver host>:1780`
1. Enjoy :)

Prebuilt versions can be downloaded as zip archive or debian package in [Releases](https://github.com/badaix/snapweb/releases).

## Setup as WebApp

On Android open `http://<snapserver host>:1780` in Chrome and select in the menu
`Add to homescreen`

## Screenshot

Screenshot is taken on a Pixel 7 emulation in Chrome DevTools

![Snapweb-Dark](https://raw.githubusercontent.com/badaix/snapweb/master/snapweb_dark.png#gh-dark-mode-only)
![Snapweb-Light](https://raw.githubusercontent.com/badaix/snapweb/master/snapweb_light.png#gh-light-mode-only)

## Containers
To be able to use this package with the snapserver container, a persistent
volume is used. For example using docker (though podman should be similar),
the container just needs to be run with a volume argument.

```
docker run --rm --volume snapweb:/snapweb ghcr.io/badaix/snapweb/snapweb:latest
```

This will create a persistent volume called `snapweb`, which can then be fed
into the snapcast container.

```
docker run --rm --volume snapweb:/usr/share/snapserver/snapweb ghcr.io/badaix/snapcast/snapaserver:latest
```

The same holds true for using compose (using a simplified example).

```
services:
  snapweb:
    image: ghcr.io/badaix/snapweb/snapweb:latest
    volumes:
      - snapweb:/snapweb
    restart: no

  snapserver:
    image: ghcr.io/badaix/snapcast/snapserver:latest
    depends_on:
      - snapweb
    volumes:
      - snapweb:/usr/share/snapserver/snapweb
```

Populating a volume can only be done once. So a new version requires either a
new volume name, e.g. `docker run --rm --volume snapweb-7.0.0:/snapweb ghcr.io/badaix/snapweb/snapweb:latest`
or removing the volume and re-running the container.

```
docker volume rm snapweb
docker run --rm --volume snapweb:/snapweb ghcr.io/badaix/snapweb/snapweb:latest
```

Both ways have their advantages and disadvantages. Removing the volume is easy,
but requires some scripting and effort in some cases. For example with compose
the name is not always known, and the volume may still be in use. Using named
volumes with version names avoids this and even allows for easy version pinning,
but requires updating startup/compose parameters.

## Contributing

Since my time and my web development skills are limited, pull requests are
highly appreciated. Please check the list of
[open issues](https://github.com/badaix/snapweb/issues).\
Branch from the `develop` branch and ensure it is up to date with the current
`develop` branch before submitting your pull request.

High prio issues:

- Missing opus support [#8](https://github.com/badaix/snapweb/issues/8)
- Missing Vorbis support [#14](https://github.com/badaix/snapweb/issues/14)
