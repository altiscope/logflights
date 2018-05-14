/*
 *
 * FlightCard component
 *
 */

import React from 'react';
import { Card } from 'antd';

import droneBg from 'images/planner/drone-background.jpg';
import Clock from './Clock';
import { CardContent } from './styles';

export default function FlightCard() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card style={{ width: 240 }} bodyStyle={{ padding: 0 }}>
      <div className="custom-image">
        <img alt="example" width="100%" src={droneBg} />
      </div>
      <CardContent>
        <Clock />
        <h2>{currentDate}</h2>
      </CardContent>
    </Card>
  );
}
