import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Crown } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useCallback, useEffect, useState } from "react";

import { getAllEvents } from "./event.api";
import EventDetailSheet from "./EventDetailSheet";
import LoadingScreen from "@/components/ui/loading-screen";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import ToggleLike from "@/components/toggle-like";
import useAsync from "@/hooks/use-async";
import PageShell from "@/components/page-shell";

export function Leaderboard() {
  const [events, setEvents] = useState([]);
  const [chartData, setChartData] = useState([]);
  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();
  const {
    isForegroundLoading,
    lastSyncTime,
    startForegroundLoading,
    stopForegroundLoading,
  } = useAsync({ initialForegroundLoading: true });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    startForegroundLoading();
    const result = await getAllEvents();

    if (!result.ok || !result?.data) {
      showMessage(
        result?.error || "Error: Something went wrong.",
        MessageTypes.ERROR
      );
      stopForegroundLoading();
      return;
    }

    function countRecentLikes(allLikes) {
      if (!Array.isArray(allLikes)) {
        return 0;
      }
      const now = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      return allLikes.filter(
        (like) =>
          like?.createdAt &&
          now - new Date(like.createdAt).getTime() <= sevenDaysMs
      ).length;
    }

    const mappedData = result.data
      .map((event) => ({
        ...event,
        id: event._id,
        recentLikes: countRecentLikes(event.allLikes),
      }))
      .sort((a, b) => b.recentLikes - a.recentLikes);
    setEvents(mappedData);

    const mostPopularEvent = mappedData?.[0];
    if (!mostPopularEvent || !mostPopularEvent?.allLikes) {
      stopForegroundLoading();
      return;
    }

    setChartData(build7DayCumulativeLikes(mostPopularEvent.allLikes));
    stopForegroundLoading();
  }, [showMessage, startForegroundLoading, stopForegroundLoading]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const refresh = useCallback(() => {
    fetchEvents();
    resetMessage();
  }, [fetchEvents, resetMessage]);

  function onIsLikeUpdate(id, isLike, numLikes) {
    setEvents(
      events.map((e) => (e._id === id ? { ...e, isLike, numLikes } : e))
    );
    setSelectedEvent((prev) =>
      prev && prev._id === id ? { ...prev, isLike, numLikes } : prev
    );
  }

  const columns = getColumns(onIsLikeUpdate);

  return (
    <>
      <EventDetailSheet
        event={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        onIsLikeUpdate={onIsLikeUpdate}
      />
      <PageShell title="Leaderboard (Last 7 days)">
        {/* Feedback message */}
        <p hidden={!isShowMessage} className={MessageTypeToColor[messageType]}>
          {message}
        </p>
        {/* Sync time indicator */}
        {lastSyncTime && (
          <div className="flex justify-end mb-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Last Updated on{" "}
              {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : ""}
            </span>
          </div>
        )}
        {isForegroundLoading ? (
          <LoadingScreen />
        ) : (
          /* Table */
          <div className="flex flex-col gap-y-4">
            <DataTable
              columns={columns}
              data={events}
              renderSideMenu={() => (
                <SideCard
                  mostPopularEvent={events?.[0]}
                  chartData={chartData}
                  refresh={refresh}
                />
              )}
              onRowClick={(row) =>
                setSelectedEvent(events.find((event) => row._id === event?._id))
              }
            />
          </div>
        )}
      </PageShell>
    </>
  );
}

function getColumns(onIsLikeUpdate) {
  const columns = [
    {
      id: "rank",
      title: "Rank",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rank" />
      ),
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    {
      accessorKey: "titleE",
      title: "Title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "isLike",
      title: "Likes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Likes" />
      ),
      cell: ({ row }) => {
        return <ToggleLike event={row.original} onUpdate={onIsLikeUpdate} />;
      },
      enableSorting: false,
    },
  ];

  return columns;
}

function SideCard({ mostPopularEvent, chartData, refresh }) {
  const likesChartConfig = {
    likes: {
      label: "Likes",
      color: "var(--chart-1)",
    },
  };

  return (
    <Card className="bg-transparent shadow-none gap-2 w-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Most popular event</span>
          <Crown className="text-yellow-400" />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {mostPopularEvent ? (
          <>
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-lg">
                {mostPopularEvent.titleE}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Recent Likes (7d):</span>
                <span className="font-bold text-yellow-500">
                  {mostPopularEvent.recentLikes}
                </span>
              </div>
            </div>

            {/* Area chart for cumulative likes over last 7 days */}
            {chartData.length > 0 ? (
              <ChartContainer
                config={likesChartConfig}
                className="aspect-auto h-[160px] w-full"
              >
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillLikes" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-likes)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-likes)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid vertical={false} />

                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={16}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                      />
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="likes"
                    stroke="var(--color-likes)"
                    fill="url(#fillLikes)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="text-xs text-muted-foreground italic">
                No likes in the last 7 days.
              </div>
            )}
          </>
        ) : (
          <div className="text-muted-foreground italic">
            No events available
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button size="sm" className="h-8" onClick={refresh}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function build7DayCumulativeLikes(allLikes = []) {
  const now = new Date();
  const days = 7;

  // Build array of date strings for last 7 days (oldest -> newest)
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dates.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
  }

  // Count likes per day
  const likesPerDay = {};
  for (const date of dates) {
    likesPerDay[date] = 0;
  }

  allLikes.forEach((like) => {
    if (!like?.createdAt) return;
    const d = new Date(like.createdAt);
    const key = d.toISOString().slice(0, 10);
    if (key in likesPerDay) {
      likesPerDay[key] += 1;
    }
  });

  // Turn into cumulative series
  let cumulative = 0;
  const chartData = dates.map((date) => {
    cumulative += likesPerDay[date] || 0;
    return { date, likes: cumulative };
  });

  return chartData;
}
