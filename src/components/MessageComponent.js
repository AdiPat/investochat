import React from 'react';

class MessageComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    getSide(owner) {
        let className = "bot";
        if (owner === 'user')
            className = "message-right";
        else if (owner === "bot")
            className = "message-left";
        return className;
    }

    render() {
        return <div className={"message " + this.getSide(this.props.owner)}>
            <div className="message-body">
                {this.props.body}
            </div>
        </div>
    }
}

export default MessageComponent;