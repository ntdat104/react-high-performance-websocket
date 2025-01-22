enum ReadyStateEnum {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

type Option = {
  url: string | URL;
  protocols?: string | string[];
};

type Subscriber = {
  id: string;
  params: string[];
  callback: (ev: MessageEvent<any>) => void;
};

type QueueMessage = string | ArrayBufferLike | Blob | ArrayBufferView;

class WebsocketService {
  private ws?: WebSocket;
  private url: string | URL;
  private protocols?: string | string[];
  private queueMessage: QueueMessage[] = [];
  private subscribers: Record<string, Subscriber> = {};
  private params: Record<string, number> = {};

  constructor(options: Option) {
    this.url = options.url;
    this.protocols = options.protocols;
  }

  public connect() {
    if (
      this.ws?.readyState !== ReadyStateEnum.CLOSED &&
      this.ws?.readyState !== undefined
    )
      return;

    this.ws = new WebSocket(this.url, this.protocols);

    this.ws.addEventListener("open", () => {});

    this.ws.addEventListener("error", (_: Event) => {});

    this.ws.addEventListener("close", () => {
      setTimeout(() => this.connect(), 2000);
    });

    this.ws.addEventListener("message", (ev: MessageEvent<any>) => {
      const evData = JSON.parse(ev?.data);
      Object.values(this.subscribers).forEach((subscriber) => {
        if (subscriber.params.includes(evData.stream)) {
          subscriber.callback(ev);
        }
      });
    });

    setInterval(() => {
      if (this.ws?.readyState === ReadyStateEnum.OPEN) {
        const request = this.queueMessage.shift();
        if (request) this.ws.send(request);
      }
    }, 300);
  }

  public addSubscriber(id: string) {
    const subscriber: Subscriber = {
      id,
      params: [],
      callback: () => null,
    };
    this.subscribers[id] = subscriber;
    return {
      send: (symbols: string[]) => this.send(id, symbols),
      subscribe: (callback: (ev: MessageEvent<any>) => void) => {
        if (this.subscribers && this.subscribers[id]) {
          this.subscribers[id].callback = callback;
        }
      },
      unsubscribe: () => {
        this.unsubscribe(id);
      },
    };
  }

  private send(id: string, symbols: string[]) {
    if (!this.subscribers[id]) return;
    const params = this.subscribers[id].params;
    const newSymbols = symbols.filter((symbol) => !params.includes(symbol));
    if (newSymbols.length === 0) return;

    this.subscribers[id].params = params.concat(newSymbols);
    const subSymbol: string[] = [];
    newSymbols.forEach((symbol) => {
      if (this.params[symbol]) {
        this.params[symbol] += 1;
      } else {
        subSymbol.push(symbol);
        this.params[symbol] = 1;
      }
    });

    this.queueMessage.push(
      JSON.stringify({
        method: "SUBSCRIBE",
        params: subSymbol,
        id: 1,
      })
    );
  }

  public unsubscribe(id: string) {
    if (!this.subscribers[id]) return;
    const params = this.subscribers[id].params;
    const unsubSymbols: string[] = [];
    params.forEach((symbol) => {
      if (this.params[symbol] > 1) {
        this.params[symbol] = this.params[symbol] - 1;
      } else {
        unsubSymbols.push(symbol);
        delete this.params[symbol];
      }
    });
    this.queueMessage.push(
      JSON.stringify({
        method: "UNSUBSCRIBE",
        params: unsubSymbols,
        id: 1,
      })
    );
    delete this.subscribers[id];
  }
}

export default WebsocketService;
