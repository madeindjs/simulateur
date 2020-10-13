# TODO

## Setup

### Development

use Docker:

```bash
docker-compose up
```

That's it.

### Production

Build a dedicated image:

```bash
docker build --tag simulateur_prod .
docker run -e MONGODB_URL=mongodb://mongo:27017/dds -e OPENFISCA_URL=https://openfisca.mes-aides.org simulateur_prod
```
