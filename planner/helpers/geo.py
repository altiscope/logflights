from django.conf import settings
from geopy.distance import distance
from geopy.point import Point as GeoPoint
from geopy.geocoders import GoogleV3
from shapely.geometry import Point as SPoint
from shapely.geometry.polygon import Polygon as SPolygon

class Geo(object):
    _has_states = [
        """ Countries that have states that should be shown in locations """
        'AU',
        'BR',
        'CA',
        'ID',
        'IN',
        'MX',
        'MY',
        'US'
    ]

    def calc_distance(points):
        """ Calculate the distance between a list of points.
            @param points Point objects like Waypoint or Telemetry
            @return distance between along the path in meters
        """
        last = None
        d = 0.0
        for p in points:
            current = GeoPoint(latitude = p.latitude, longitude = p.longitude)
            if last is None:
                last = current
                continue
            d = d + distance(last, current).meters
            last = current
        return d

    def get_location(point):
        """ Look up the human-readable location for a location.
            @param point object, like Waypoint or Telemetry
            @return object with 'location' and 'country' fields.
        """
        result = {
            'location': None,
            'country': None,
        }
        geo = GoogleV3(api_key=settings.GOOGLE_MAPS_API_KEY)
        p = GeoPoint(latitude = point.latitude, longitude = point.longitude)
        address = geo.reverse(p, sensor=True)
        if address is None:
            # It is possible for a user to have coordinates which are
            # over the ocean.
            return result
        r = address[0].raw['address_components']
        for loc in r:
            if 'neighborhood' in loc['types']:
                result['neighborhood'] = loc['long_name']
            if 'locality' in loc['types']:
                result['locality'] = loc['long_name']
            if 'administrative_area_level_1' in loc['types']:
                result['region'] = loc['short_name']
            if 'country' in loc['types']:
                result['country'] = loc['short_name'][:2]
                if 'locality' in result:
                    result['location'] = result['locality']
                elif 'neighborhood' in result:
                    result['location'] = result['neighborhood']
                if result['location'] is None:
                    result['location'] = loc['long_name']
                else:
                    if result['country'] in Geo._has_states:
                        result['location'] = "%s, %s" % (result['location'], result['region'])
                    country = loc['long_name'] if len(loc['long_name']) <= 10 else loc['short_name']
                    result['location'] = "%s, %s" % (result['location'], country)
        return result

    def within(longitude, latitude, regions):
        """ Given a point-like object (Waypoint, Telemetry)
            determine if that point is within a region.
            @param point a Waypoint/Telemetry object
            @param region is defined as a list that contains lists of (long,lat) pairs
            @return True if in the region
        """
        for r in regions:
            poly = SPolygon(r)
            p = SPoint(longitude, latitude)
            if poly.contains(p):
                return True
        return False
