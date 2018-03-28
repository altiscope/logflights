from django.contrib.auth.models import User
from planner.models import Operator

def create_user_operator():
    user = User.objects.create_user(
        username='airbus', email='info@airbus.com', password='setting_the_standards')
    operator = Operator.objects.create(
        user=user,
        organization="Airbus",
        mobile_number="+33581317500"
    )
    return (user, operator)
