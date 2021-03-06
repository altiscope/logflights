# Generated by Django 2.0.4 on 2018-05-07 21:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0007_auto_20180425_2243'),
    ]

    operations = [
        migrations.AddField(
            model_name='operator',
            name='altitude_unit',
            field=models.CharField(choices=[('f', 'Feet'), ('m', 'Meters')], default='f', max_length=1, verbose_name='altitude unit'),
        ),
        migrations.AlterField(
            model_name='waypointmetadata',
            name='processor',
            field=models.IntegerField(choices=[(0, 'unknown'), (1, 'Mission Planner .waypoints'), (2, 'QGroundControl .plan'), (3, 'Keyhole Markup Language .kml'), (3, 'Manual entered array data')], default=0, verbose_name='waypoint parser'),
        ),
    ]
