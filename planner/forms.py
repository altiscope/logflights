from django import forms
from .models import Operator, Vehicle, FlightPlan, Manufacturer
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db.models import Case, Value, When
from django.db.models.functions import Lower
from django.forms import ModelChoiceField

class SignupForm(forms.ModelForm):
    first_name = forms.CharField(max_length=100)
    last_name = forms.CharField(max_length=100)

    class Meta:
        model = Operator
        fields = (
            'organization',
            'mobile_number'
        )

    def signup(self, request, user):
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.save()

        Operator.objects.create(
            user = user,
            organization = self.cleaned_data['organization'],
            mobile_number = self.cleaned_data['mobile_number']
        )

class VehicleForm(forms.ModelForm):
    manufacturer = ModelChoiceField(
        # sort the first key, which is "Other" to the beginning of the list
        queryset=Manufacturer.objects.order_by(Case(When(id__exact=0, then=Value('00000')), default=Lower('name'))),
        empty_label=None,
        initial=0,
    )
    class Meta:
        model = Vehicle
        fields = (
            'model',
            'serial_number',
            'vehicle_type',
            'empty_weight',
            'manufacturer',
            'state'
        )

class FlightPlanForm(forms.ModelForm):
    wm_id = forms.CharField(label="Flight plan", required=False)

    def __init__(self,user,*args,**kwargs):
        super(FlightPlanForm,self).__init__(*args,**kwargs)
        operator = Operator.objects.filter(user=user).first()
        if operator:
            self.fields['vehicle'].queryset = Vehicle.objects.filter(operator=user.operator, state=Vehicle.STATE_ACTIVE)

    class Meta:
        model = FlightPlan
        fields = (
            'flight_id',
            'wm_id',
            'planned_departure_time',
            'planned_arrival_time',
            'payload_weight',
            'vehicle',
            'mission_type'
        )

class EditProfileForm(forms.ModelForm):
    organization = forms.CharField(required=True)
    mobile_number = forms.CharField(required=True)

    class Meta:
        model = User
        fields = (
            'first_name',
            'last_name',
            'email',
            'organization',
            'mobile_number'
        )

    def __init__(self, *args, **kwargs):
        super(EditProfileForm, self).__init__(*args, **kwargs)

        self.fields['first_name'].required = True
        self.fields['last_name'].required = True

    def save(self):
        super(EditProfileForm,self).save()
        operator = self.instance.operator
        operator.organization = self.cleaned_data['organization']
        operator.mobile_number = self.cleaned_data['mobile_number']
        operator.save()

class ChangePasswordForm(forms.ModelForm):
    oldpassword = forms.CharField(required=True)
    password1 = forms.CharField(required=True)
    password2 = forms.CharField(required=True)

    class Meta:
        model = User
        fields = (
            'oldpassword',
            'password1',
            'password2'
        )

    def clean_oldpassword(self):
        if not self.instance.check_password(self.cleaned_data.get("oldpassword")):
            raise forms.ValidationError("Please type your current password.")
        return self.cleaned_data["oldpassword"]

    def clean(self):
        if not (self.cleaned_data.get("password1") == self.cleaned_data.get("password2")):
            raise forms.ValidationError("Password1 and Password2 must match.")
        return self.cleaned_data

    def save(self):
        user = self.instance
        user.set_password(self.cleaned_data["password1"])
        user.save()
