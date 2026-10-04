import React from 'react';

// Base class for the page logic, ported from the Claude Design runtime
// (support.js → StreamableLogic). State updates are applied synchronously to
// `this.state` and then trigger a re-render, exactly like the original, so the
// scroll-driven storyboard reads fresh state between scroll events.
export class DCLogic {
  constructor(props) {
    this.props = props || {};
    this.state = {};
    this.__host = null;
  }
  setState(update, cb) {
    this.__host && this.__host.__setLogicState(update, cb);
  }
  forceUpdate() {
    this.__host && this.__host.forceUpdate();
  }
  componentDidMount() {}
  componentDidUpdate(_prevProps) {}
  componentWillUnmount() {}
  /** The flat object the view renders against (merged over props). */
  renderVals() {
    return {};
  }
}

// Hosts a DCLogic instance and renders `view` with its values
// (ported from the runtime's StreamableComponent).
export class LogicHost extends React.Component {
  constructor(props) {
    super(props);
    this.state = { v: 0 };
    this.logic = new props.logic(this.userProps());
    this.logic.__host = this;
  }
  userProps() {
    const { logic, view, ...rest } = this.props;
    return rest;
  }
  __setLogicState(update, cb) {
    const prev = this.logic.state;
    const patch = typeof update === 'function' ? update(prev) : update;
    this.logic.state = { ...prev, ...patch };
    this.setState(s => ({ v: s.v + 1 }), cb);
  }
  componentDidMount() {
    this.logic.componentDidMount();
  }
  componentDidUpdate(prevProps) {
    this.logic.props = this.userProps();
    this.logic.componentDidUpdate(prevProps);
  }
  componentWillUnmount() {
    this.logic.componentWillUnmount();
  }
  render() {
    const userProps = this.userProps();
    this.logic.props = userProps;
    const vals = { ...userProps, ...this.logic.renderVals() };
    const View = this.props.view;
    return (
      <div className="app-root">
        <View v={vals} />
      </div>
    );
  }
}
