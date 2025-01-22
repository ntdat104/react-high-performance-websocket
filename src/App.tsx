import React from "react";
import ModuleA from "./components/ModuleA";
import ModuleB from "./components/ModuleB";
import { useAppDispatch } from "./redux/hooks";
import { connect } from "./redux/ws-slice";
import ModuleC from "./components/ModuleC";

const App: React.FC = (): JSX.Element => {
  const dispatch = useAppDispatch();

  const [toggleA, setToggleA] = React.useState(true);
  const [toggleB, setToggleB] = React.useState(true);
  const [toggleC, setToggleC] = React.useState(true);

  React.useEffect(() => {
    dispatch(connect());
  }, []);

  return (
    <>
      {toggleA && <ModuleA />}
      {toggleB && <ModuleB />}
      {toggleC && <ModuleC />}
      <button onClick={() => setToggleA(!toggleA)}>{`Toggle A`}</button>
      <button onClick={() => setToggleB(!toggleB)}>{`Toggle B`}</button>
      <button onClick={() => setToggleC(!toggleC)}>{`Toggle C`}</button>
    </>
  );
};

export default App;
