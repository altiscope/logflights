from abc import abstractmethod
from celery import shared_task
from datetime import datetime
from django.conf import settings
from django.core.files.storage import default_storage
from io import StringIO
import json
from pytz import utc
from .models import Assessment, document_path
from .helpers.geo import Geo

def import_class(cl):
    d = cl.rfind(".")
    classname = cl[d+1:len(cl)]
    m = __import__(cl[0:d], globals(), locals(), [classname])
    return getattr(m, classname)

@shared_task
def run_assessment(assessment_id):
    """ Dispatch a task to run the assessment and process its results """
    a = Assessment.objects.get(id=assessment_id)
    try:
        kls = import_class(a.klass)()
    except Exception as e:
        a.state = Assessment.STATE_ERROR
        a.error = 'Assessment class not found: %s (%s)' % (a.klass, str(e))
        a.save()
        return None
    wp_raw = a.flight_plan.waypoints.waypoints.order_by('order')
    wp = [(w.longitude, w.latitude, w.altitude_relative) for w in wp_raw]
    flight = {
        'pilot': {
            'name': a.flight_plan.pilot_name,
            'phone': a.flight_plan.pilot_phone
        },
        'fp': {
            'departure': a.flight_plan.planned_departure_time,
            'arrival': a.flight_plan.planned_arrival_time,
        },
        'waypoints': wp
    }
    report = None
    try:
        a.run_at = datetime.now(utc)
        report = kls.assess(flight)
        report['input'] = flight
        if report['success']:
            a.state = Assessment.STATE_SUCCESS
        else:
            a.state = Assessment.STATE_FAIL
        a.save()
        report_filename = 'assess_{name}.json'.format(name=kls.info()['short_name'])
        report_path = document_path(a.flight_plan, report_filename)['path']
        j = json.dumps(report, ensure_ascii=False, indent=4, sort_keys=True, default=str)
        default_storage.save(report_path, StringIO(j))
        a.report = report_path
        a.save()
    except Exception as e:
        a.state = Assessment.STATE_ERROR
        a.error = str(e)
        a.save()
    return report

class AssessmentService(object):
    """ An abstract class that provides assessment functions.
        May be sub-classed, or provide a class with the same
        function signatures.
    """
    @property
    @abstractmethod
    def _info(self):
        """
        A dict object with the keys:
        * name: display name of the assessment
        * short_name: how to refer to this assessment internally
        * description: a description of the assessment
        * disclaimer: text shown to an operator using this assessment
        * policy: a link to privacy or other policy
        * region: list of geographic polygons that define the region this assessment applies
            leave this and country blank to apply everywhere
        * country: list of 2-letter country codes where this applies.
            assessment applies to region _or_ country, both can be specified
        * submit: does this library support submitting for authorization
        """
        pass

    @abstractmethod
    def info(self):
        """ Information about the assessment that can be used by
            UI or database to refer to it.
        """
        return self._info

    @abstractmethod
    def assess(self, flight):
        """ Perform an assessment and return the results in an object.
            This function is asynchronous, so you'll need to get a callback.
            @param flight object of the form:
            {
                pilot: {
                    name: str,
                    phone: str,
                    location: (lon, lat, alt_agl_ft) # optional
                },
                waypoints: [(lon, lat, alt_agl_ft)],
                fp: {
                    departure: datetime(utc),
                    arrival: datetime(utc)
                }
            }
            @return an assessment ID
        """
        pass

class Assess(object):
    def __init__(self):
        # load settings, store locally
        self._assessment_classes = {}
        self._assessment_info = {}
        for a in settings.ASSESSMENTS:
            kls = import_class(a)()
            info = kls.info()
            for (k, v) in info.items():
                if type(info[k]) is str:
                    info[k] = info[k].format(name=settings.SITE_NAME)
            self._assessment_classes[info['short_name']] = a
            self._assessment_info[info['short_name']] = info

    def get_all(self):
        """ Get info about all assessments """
        return self._assessment_info

    def get_by_name(self, name):
        """ Get info about a specific asssessment """
        return self._assessment_info[name]

    def is_eligible(self, fp, short_name):
        """ Determine if a fp is eligible for a particular assessment """
        wm = fp.waypoints
        if wm is None or short_name not in self._assessment_info:
            return False
        a = self._assessment_info[short_name]
        if 'region' in a and a['region'] is not None and len(a['region']) > 0 and wm.start_longitude is not None:
            in_region = Geo.within(wm.start_longitude, wm.start_latitude, a['region'])
        if 'country' in a and a['country'] is not None and len(a['country']) > 0 and wm.country is not None:
            in_country = wm.country in a['country']
        return in_region or in_country

    def get_eligible(self, fp):
        """ Given a flight plan, return all eligible assessments """
        wm = fp.waypoints
        if wm is None:
            return []
        result = {}
        for short_name in self._assessment_info.keys():
            if self.is_eligible(fp, short_name):
                result[short_name] = self._assessment_info[short_name]
        return result

    def assess(self, name, fp, async=True):
        """ Run the named assessment on a flight plan.
            This function assumes that the user that requested this assessment
            is permitted to do so.
            @param name short name of the assessment
            @param fp a FlightPlan object
            @param run the task asynchronously (turn off for unit testing)
        """
        if name not in self._assessment_info:
            raise KeyError('Assessment name not found')
        a = Assessment.objects.create(
            flight_plan=fp,
            state=Assessment.STATE_PROCESSING,
            name=name,
            klass=self._assessment_classes[name]
        )
        if async:
            run_assessment.delay(a.id)
        else:
            run_assessment(a.id)
        return a.id

    def get_assessment(self, assessment_id):
        """ For an assessment_id, get all assessment data
        @return object should have the form:
        {
            success: True/False,
            notices: {
                id: num,
                message: str_message,
                regulation: str_regulation
            },
            data: {
                # opaque object about the assessment
            }
        }
        """
        try:
            a = Assessment.objects.get(id=assessment_id)
            report_file = default_storage.open(a.report, 'r')
        except:
            return None
        d = report_file.read()
        return d

    def get_assessment_state(self, assessment_id):
        """ Get the state of an assessment. Defined in the model.
        """
        try:
            a = Assessment.objects.get(id=assessment_id)
        except SomeModel.DoesNotExist:
            return None
        return a.state
