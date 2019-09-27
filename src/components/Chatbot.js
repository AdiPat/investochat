import React from 'react';
import MessageComponent from './MessageComponent';
import ai from '../ai';

class Chatbot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            input: "",
            messages: [
                ["Welcome to InvestoBot. How may I help you?", "bot"],
            ],
            result: "",
        };
        this.handleInput = this.handleInput.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.getMessages = this.getMessages.bind(this);
        this.getResult = this.getResult.bind(this);
    }

    handleInput(evt) {
        let inputText = evt.target.value;
        this.setState({
            input: inputText,
        });
    }

    async getResult(input) {
        let res = ai.getMaxProfit("TCS", 500, 500, 500);
        return res;
    }

    async handleClick(evt) {
        let inputValue = this.state.input;
        if (inputValue) {
            let result = await this.getResult(inputValue);
            let newMessages = this.state.messages.splice(0);
            // clear input
            this.setState({ input: "" });
            // push input message
            newMessages.push([inputValue, "user"]);
            this.setState({ messages: newMessages });
            // show wait message
            newMessages.push(["Please wait...", "bot"]);
            setTimeout(() => this.setState({ messages: newMessages }), 500);
            // push result to messages stack
            newMessages = this.state.messages.splice(0);
            newMessages.push([result, "bot"]);
            setTimeout(() => this.setState({ messages: newMessages, result: "" }), 8000);
        }
    }

    handleKeyPress(evt) {
        if (evt.key == "Enter") {
            this.handleClick(evt);
        }
    }


    // gets messages from state and maps them to components for rendering
    getMessages() {
        let messageComps = this.state.messages.map((val) =>
            <MessageComponent body={val[0]} owner={val[1]} />
        );
        return messageComps;
    }

    render() {
        let messages = this.getMessages();


        return <div className="chatbot">
            <div className="chatbot-header">
                InvestoBot
            </div>
            <div className="chatbot-body">
                {messages}
            </div>
            <div className="chatbot-input">
                <input type="text" value={this.state.input} onKeyPress={this.handleKeyPress} onChange={this.handleInput}></input>
                <button onClick={this.handleClick}>SEND</button>
            </div>
        </div>
    }
}

export default Chatbot;
