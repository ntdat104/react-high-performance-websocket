import React from "react";
import { useAppSelector } from "../redux/hooks";

const ModuleC: React.FC = (): JSX.Element => {
  const ws = useAppSelector((state) => state.websocket.ws);

  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const subscriber = ws.addSubscriber("ModuleC");
    subscriber.send([
      "adausdt@kline_15m",
      "bnbusdt@kline_1m",
      "btcusdt@kline_15m",
      "ethusdt@kline_15m",
    ]);
    subscriber.subscribe((ev) => {
      setCount((count) => count + 1);
      console.log("moduleC", ev);
    });

    return () => subscriber.unsubscribe();
  }, []);

  return <div>{`ModuleC_${count}`}</div>;
};

export default ModuleC;
