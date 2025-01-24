import { useAppSelector } from "@/redux/hooks";
import axios from "axios";
import {
  ColorType,
  createChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  Time,
} from "lightweight-charts";
import React from "react";

interface Props {
  ticker: string;
  interval?: string;
  limit?: number;
}

const CandlestickChart: React.FC<Props> = (props) => {
  const { ticker, interval = "1m", limit = 50 } = props;
  const ws = useAppSelector((state) => state.websocket.ws);
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi>();
  const seriesRef = React.useRef<ISeriesApi<any>>();
  const [ohlcv, setOhlcv] = React.useState<any[]>();
  const resizeObserver = React.useRef<ResizeObserver>();

  React.useEffect(() => {
    const apiUrl = `https://api.binance.com/api/v3/uiKlines?symbol=${ticker}&timeZone=7&interval=${interval}&limit=${limit}`;
    (async () => {
      try {
        const response = await axios.get(apiUrl);
        const data = response.data;
        const ohlcvData = data.map((d: any) => ({
          startTime: d[0],
          time: d[0] / 1000,
          open: Number(d[1]),
          high: Number(d[2]),
          low: Number(d[3]),
          close: Number(d[4]),
          volume: Number(d[5]),
          endTime: d[6],
        }));
        setOhlcv(ohlcvData);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!ohlcv) return;
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        attributionLogo: false,
        textColor: "white",
        background: { type: ColorType.Solid, color: "transparent" },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      height: chartContainerRef.current.offsetHeight,
      timeScale: {
        fixLeftEdge: true,
        fixRightEdge: true,
        timeVisible: true,
        secondsVisible: false,
        borderVisible: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      grid: {
        vertLines: {
          color: "transparent",
        },
        horzLines: {
          color: "transparent",
        },
      },
    });

    chartRef.current = chart;

    const series = chart.addCandlestickSeries({
      upColor: "#2EBD85",
      downColor: "#F6465D",
      borderVisible: false,
      wickUpColor: "#2EBD85",
      wickDownColor: "#F6465D",
    });

    seriesRef.current = series;

    series.setData(ohlcv);
    chart.timeScale().fitContent();

    let lastBar: any = null;

    const subscriber = ws.addSubscriber(`CandlestickChart_${ticker}`);
    subscriber.send([`${ticker.toLowerCase()}@kline_${interval}`]);
    subscriber.subscribe((event: MessageEvent<any>) => {
      const message = JSON.parse(event.data);
      if (
        message?.data?.e === "kline" &&
        message?.data?.k?.i === interval &&
        message?.data?.k?.s === ticker
      ) {
        const kline = message?.data?.k;
        const bar = {
          time: (Number(kline.t) / 1000) as Time,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v),
        };

        if (!lastBar || bar.time > lastBar.time) {
          lastBar = bar;
          series.update(bar);
        } else if (bar.time === lastBar.time) {
          lastBar = bar;
          series.update(bar);
        }
      }
    });

    return () => {
      chart.remove();
      subscriber.unsubscribe();
    };
  }, [ohlcv]);

  React.useEffect(() => {
    resizeObserver.current = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chartRef.current?.applyOptions({ width, height });
      setTimeout(() => {
        chartRef.current?.timeScale().fitContent();
      }, 0);
    });

    resizeObserver.current.observe(chartContainerRef.current as any);

    return () => resizeObserver.current?.disconnect();
  }, []);

  return <div className="h-full w-full" ref={chartContainerRef} />;
};

export default CandlestickChart;
