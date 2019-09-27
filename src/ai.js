import Deque from 'collections/deque';

/**
 * 
 * State: Represents the portfolio details of the user at a given date
 * 
 */

class State {

    /**
     * 
     * @param {number} price Price of stock at date 
     * @param {Date} date Date corresponding to state
     * @param {number} amount Disposable amount that can be used to buy stocks
     * @param {int} numStocks Number of stocks held
     * @param {number} profit Net profit since start date
     * 
     */
    constructor(price, date, amount, numStocks, profit) {
        this.price = price;
        this.date = date;
        this.amount = amount;
        this.profit = profit;
        this.numStocks = numStocks;
        this.children = [];
    }
}

/**
 * 
 * StateSpace: State Space Representation (Tree)
 * 
 */

class StateSpace {

    /**
     * 
     * Builds Search Tree
     * @param {prices}} array of prices for 30 days
     * 
     */

    constructor(prices, amount, startDate, goalDate, numStocks) {
        this.prices = prices;
        this.amount = amount;
        this.startDate = startDate;
        this.goalDate = goalDate;
        this.numStocks = numStocks;
        this.startState = new State(this.prices[0], this.amount, this.startDate, this.goalDate, 0);
        this.space = this.buildSpace();
    }

    /**
     * 
     * Builds search space using BFS with a deque
     * 
     */

    buildSpace() {
        let rootNode = this.startState;
        // stores each level of the tree
        let curNode = rootNode;
        let q = new Deque(curNode);
        let curDay = 0;
        while (q.length > 0 && curDay <= 30) {
            let curNode = q.shift(0); // remove first item
            // builds children for the state
            console.log(Object(curNode));
            curNode = this.buildNextStates(curNode, curDay);
            q.push(curNode.children); // add children to queue
            curDay += 1;
        }
        return rootNode;
    }

    /**
     *
     * Builds children (next) states for a state by applying production rules on it
     * 
     * @param {State} curState Current State 
     * @param {int} day Day number  
     * 
     */

    buildNextStates(curState, day) {
        if (day + 1 > 30)
            return null;

        let buyLimit = Math.floor(curState.amount / curState.price);
        for (let i = 0; i < buyLimit; i++) {
            let buyState = this.productionRule_buy(curState, { buyCount: i, newPrice: this.prices[day + 1] });
            curState.children.push(buyState);
        }

        let sellLimit = curState.numStocks;
        for (let i = 0; i < sellLimit; i++) {
            let sellState = this.productionRule_sell(curState, { sellCount: i, newPrice: this.prices[day + 1] });
            curState.children.push(sellState);
        }
        return curState;
    }

    /** 
     * 
     * Applies buyStock(x) production rule to State 
     * 
     * buyStock(x)
     * 
     * state.numStocks => state.numStocks + x
     * state.amount => state.amount - x * state.price
     * state.profit => state.profit + (state.price - oldPrice)
     * 
     * */

    productionRule_buy(oldState, args) {
        // check if we have the amount to buy
        let buyCount = args['buyCount'];
        let newPrice = args['newPrice'];
        if (buyCount < 0 || oldState.amount <= buyCount * newPrice) {
            return null;
        }

        let newStateInfo = {
            price: newPrice,
            date: oldState.date + 1,
            numStocks: oldState.numStocks + buyCount,
            amount: oldState.amount - buyCount * newPrice,
            profit: oldState.profit + (newPrice - oldState.price)
        };

        let newState = new State(newStateInfo.price, newStateInfo.date, newStateInfo.amount, newStateInfo.numStocks, newStateInfo.profit);
        return newState;
    }

    /** 
     * 
     * Applies sellStock(x) production rule to State 
     * 
     * sellStock(x)
     * 
     * state.numStocks => state.numStocks - x
     * state.amount => state.amount + x * state.price
     * state.profit => state.profit + (state.price - oldPrice)
     * 
     * */

    productionRule_sell(oldState, args) {
        let sellCount = args['sellCount'];
        let newPrice = args['newPrice'];
        // check if we have the number of stocks to sell
        if (sellCount < 0 || sellCount > oldState.numStocks) {
            return null;
        }

        let newStateInfo = {
            price: newPrice,
            date: oldState.date + 1,
            numStocks: oldState.numStocks - sellCount,
            amount: oldState.amount + sellCount * newPrice,
            profit: oldState.profit + (newPrice - oldState.price)
        };

        let newState = new State(newStateInfo.price, newStateInfo.date, newStateInfo.amount, newStateInfo.numStocks, newStateInfo.profit);
        return newState;
    }

    /**
     * 
     * Explores search tree and returns max profit
     * 
     * Uses a Depth-First Heuristic Search
     * heuristic => 50% profit or more is good enough
     * 
     */

    getMaxProfit() {
        // 50% profit is acceptable
        let acceptableThreshold = 0.5;
        let acceptableResult = this.startState.amount * (1 + acceptableThreshold);
        let result = 0;
        let q = new Deque([this.space]);
        while (q.length > 0 && result < acceptableResult) {
            let curNode = q.shift(0); // pop first
            // check all children
            curNode.children.forEach((childState, idx) => {
                // check profit
                if (childState.profit >= acceptableResult)
                    return childState.profit;
                if (childState.profit > result)
                    result = childState.profit;
                q.push(childState);
            });
        }
        return result;
    }
}

const _aihelpers = {
    // returns a list of daily prices till goal date
    getPrices: function (stockName, goalDate) {
        let prices = Array(30).fill(0);
        // dynamically get from JSON file
        prices = prices.map((val) => val + (Math.random() * 20 + (100 - 80)));
        return prices;
    },

    // builds search tree
    getOptimalProfit: function (amount, numStocks, prices) {
        let startAmount = amount;
        let startDate = new Date();
        let goalDate = new Date(startDate + 30);
        // build search space
        let stateSpace = new StateSpace(prices, amount, startDate, goalDate, numStocks);
        let res = stateSpace.getMaxProfit();
        return res;
    }
};

const ai = {
    getMaxProfit: async function (stockName, amount, numStocks, goalDate) {
        let prices = _aihelpers.getPrices(stockName, goalDate);
        let res = _aihelpers.getOptimalProfit(amount, numStocks, prices);
        return res;
    }
};

export default ai; 