import React from "react";
import { useAppSelector } from "../redux/hooks";

const ModuleB: React.FC = (): JSX.Element => {
  const ws = useAppSelector((state) => state.websocket.ws);

  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const subscriber = ws.addSubscriber("ModuleB");
    subscriber.send([
      "ethusdt@kline_15m",
      "ethusdt@kline_1m",
      "btcusdt@kline_15m",
    ]);
    subscriber.subscribe((ev) => {
      setCount((count) => count + 1);
      console.log("moduleB", ev);
    });

    return () => subscriber.unsubscribe();
  }, []);

  return <div>{`ModuleB_${count}`}</div>;
};

export default ModuleB;
