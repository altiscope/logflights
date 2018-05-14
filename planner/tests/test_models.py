# -*- coding: utf-8 -*-
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User

from planner.models import Operator

## models.py
class OperatorModel(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='airbus', email='info@airbus.com', password='setting_the_standards')

    def test_valid_operator(self):
        airbus = Operator.objects.create(
            user=self.user,
            organization="Airbus",
            mobile_number="+33581317500"
        )
        self.assertEqual(airbus.organization, "Airbus")
        self.assertEqual(airbus.mobile_number, "+33581317500")

    def test_invalid_phone(self):
        airbus = Operator.objects.create(
            user=self.user,
            organization="Airbus"
        )
        airbus.full_clean()
        airbus.mobile_number = "0581317500"
        self.assertRaises(ValidationError, airbus.full_clean)
