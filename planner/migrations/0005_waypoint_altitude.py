# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-02-24 02:49
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0004_auto_20180221_0304'),
    ]

    operations = [
        migrations.AddField(
            model_name='waypoint',
            name='altitude',
            field=models.IntegerField(blank=True, null=True, verbose_name='altitude (cm, MSL)'),
        ),
        migrations.AlterField(
            model_name='telemetrymetadata',
            name='processor',
            field=models.IntegerField(choices=[(0, 'unknown'), (3, 'bin'), (5, 'csv'), (4, 'ddlog'), (6, 'kml'), (1, 'ulog'), (2, 'tlog')], default=0, verbose_name='telemetry parser'),
        ),
        migrations.AlterField(
            model_name='waypointmetadata',
            name='processor',
            field=models.IntegerField(choices=[(0, 'unknown'), (1, 'Mission Planner .waypoints'), (2, 'QGroundControl .plan'), (3, 'Keyhole Markup Language .kml')], default=0, verbose_name='waypoint parser'),
        ),
    ]
