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
* Python 2.7 (`pyenv` is useful if you need to run multiple versions)
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

http://127.0.0.1:8000/admin

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
