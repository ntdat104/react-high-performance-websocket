import React from "react";
import { useAppSelector } from "../redux/hooks";

const ModuleA: React.FC = (): JSX.Element => {
  const ws = useAppSelector((state) => state.websocket.ws);

  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const subscriber = ws.addSubscriber("ModuleA");
    subscriber.send(["btcusdt@kline_1m", "btcusdt@kline_15m"]);
    subscriber.subscribe((ev) => {
      setCount((count) => count + 1);
      console.log("moduleA", ev);
    });

    return () => subscriber.unsubscribe();
  }, []);

  return <div>{`ModuleA_${count}`}</div>;
};

export default ModuleA;
