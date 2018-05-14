# log.flights

log.flights drone flight planning and logging service

## Overview

log.flights is an open source web service for planning, logging, and reporting on
drone flights. In the interest of promoting a safety culture in drone aviation,
log.flights provides open reporting tools for public transparency in operations.
Drone operators can jointly see planned and completed flights, understanding who
else is operating in the area and learning from each other's operations.

## Running log.flights

To run the log.flights code on your local development machine,
you'll need to install the requirements and then set up the Django application.

### Requirements

You will need Python and related tools installed:
* Python 3.6 (`pyenv` is useful if you need to run multiple versions, Python2 is not supported)
* PIP
* VirtualEnv: `pip install virtualenv`

Libraries:
* Libmagic

And services:
* Redis
* SQLite
* PostgreSQL _(optional)_

Uploads and documents are stored with Google Cloud Storage.
See the section below for setting local settings

### Running locally for development

Enter a new virtualenv and install application dependencies.

```
virtualenv <name>
<name>/bin/pip install -r requirements.txt
```

You'll need credentials for a Google Cloud service account stored in a JSON file.
Store the JSON file somewhere securely on your system, such as `~/.google`.

Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to
the JSON file.

```
export GOOGLE_APPLICATION_CREDENTIALS=~/.google/creds.json
```

Settings that are specific to your deployment should be set in `logflights/local_settings.py`.
This file will not exist, you should create it. It is imported as a standard python
file. Common things to include in this file are:

```
SITE_NAME='log.flights'
GOOGLE_MAPS_API_KEY = 'YOUR_GMAPS_KEY'
SENDGRID_API_KEY='YOUR_KEY'
```

You'll also need to know the name of the GCS bucket to use for development.
The app includes a default test bucket, `logflights_data_test`.
To use a different bucket, also set environment variable `GS_BUCKET_NAME`.

Set up the database by running migrations, adding fixtures for default data, and collecting static files:

```
<name>/bin/python manage.py migrate
<name>/bin/python manage.py loaddata --app planner manufacturers missions
<name>/bin/python manage.py collectstatic
```

Add an admin user:

```
<name>/bin/python manage.py createsuperuser
```

Then run the development server:

```
<name>/bin/python manage.py runserver
```

In a separate window, run celery to process asynchronous tasks:

```
<name>/bin/celery -A logflights worker -l info
```

Log into the admin console and set up default fields:

http://127.0.0.1:8000/_/admin/

## Running log.flights Frontend

### Installing Dependencies
```
cd frontend/ && yarn
```

### Running the application
```
cd frontend/ && yarn run dev
```

App will run at:

http://127.0.0.1:3000

### Google Analytics

Update the files in `frontend/.env.production` and `frontend/env.local` with your Google Analytics tracking ID.

Example:

```
GOOGLE_ANALYTICS_TRACKING_ID=UA-Example-1
```

### Lint before commit
```
cd frontend/ && yarn run lint
```

or lint staged files only
```
cd frontend/ && yarn run lint:staged
```

### Running Tests

```
cd frontend/ && yarn run test
```

#### Note on static files
- `terms-of-service.md` and `privacy-policy.md` are loaded by webpack markdown loader from `frontend/app/static`

## Supported file formats

log.flights allows the upload of flight plans (waypoints) and flight telemetry.

### Waypoints

Supported formats:
* QGroundControl/MissionPlanner TEXT waypoint files ending in `.waypoints`
* QGroundControl JSON waypoint files ending in `.plan`
* Keyhole Markup Language / Google Earth documents `.kml` and `.kmz`

### Telemetry

Supported formats:
* APM binary logs (`.BIN`, often stored on an SD card on the drone)
* [Mission Planner telemetry logs](http://ardupilot.org/copter/docs/common-mission-planner-telemetry-logs.html) (`.tlog`)
* [PX4 / QGroundControl logs](https://dev.px4.io/en/log/ulog_file_format.html) (`.ulog`)
* [DroneDeploy logs](https://support.dronedeploy.com/docs/gathering-flight-logs) (`.log` or `.txt`)
* [Airdata CSV log exports](https://twitter.com/AirdataUAV/status/655497788050903040) (`.csv`) – do not use `.kml` export, it doesn’t support `TimeSpan`.
* [Keyhole Markup Language / Google Earth documents](https://developers.google.com/kml/documentation/) (`.kml` and `.kmz`)

> **NOTE:**  We highly discourage using `.kml`/`.kmz` documents for telemetry logs. They lack much of the critical information found in telemetry logs. Only `.kml`/`.kmz` files with `TimeSpan` elements supplied are accepted; `.kml`/`.kmz` files without `TimeSpan` elements will be rejected as unsupported file types.


## License

log.flights is licensed under the [BSD 3-clause license](./LICENSE).

This project was started by [Altiscope](http://altiscope.io), part of [A³ by Airbus](https://airbus-sv.com).
