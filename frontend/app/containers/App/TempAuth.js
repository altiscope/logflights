import React, { PureComponent } from 'react';
import { message, Form, Input, Button } from 'antd';

class TempAuth extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      code: '',
    };
    this.onSubmit = this.onSubmit.bind(this);
  }
  onSubmit(event) {
    event.preventDefault();
    if (this.state.code === 'flydrones') {
      window.location.replace('/planner');
      return true;
    }
    message.error('Invalid Code');
    return false;
  }

  render() {
    return (
      <div style={{ margin: '0 auto', padding: 20, width: '50%' }}>
        <h3>Please enter authentication code:</h3>
        <Form onSubmit={this.onSubmit}>
          <div>
            <Input
              placeholder="Enter Code"
              type="password"
              style={{ width: 300 }}
              onChange={(event) =>
                this.setState({
                  code: event.target.value,
                })
              }
            />
          </div>
          <div>
            <Button type="primary" htmlType="submit" onClick={this.onSubmit}>
              Submit
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default TempAuth;
