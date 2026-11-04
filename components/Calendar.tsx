"use client";

import dayjs from "dayjs";
import { useBoundStore } from "@/hooks/useBoundStore";
import { ChevronLeftSvg, ChevronRightSvg } from "./Svgs";
import { range } from "@/utils/array-utils";

const getCalendarDays = (now: dayjs.Dayjs): (number | null)[][] => {
  const startOfMonth = now.startOf("month");
  const calendarDays: (number | null)[][] = [];
  const firstWeekEndDate = 8 - startOfMonth.day();
  const firstWeek = [
    ...range(0, startOfMonth.day()).map(() => null),
    ...range(1, firstWeekEndDate),
  ];
  calendarDays.push(firstWeek);
  for (
    let weekStartDate = firstWeekEndDate;
    weekStartDate <= now.daysInMonth();
    weekStartDate += 7
  ) {
    calendarDays.push(
      range(weekStartDate, weekStartDate + 7).map((date) =>
        date <= now.daysInMonth() ? date : null,
      ),
    );
  }
  return calendarDays;
};

export const Calendar = ({
  now,
  setNow,
}: {
  now: dayjs.Dayjs;
  setNow: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>;
}) => {
  const isActiveDay = useBoundStore((x) => x.isActiveDay);
  const formattedNowMonth = now.format("MMMM YYYY");
  const staticNow = dayjs();
  const calendarDays = getCalendarDays(now);
  return (
    <article className="flex flex-col rounded-xl border-2 border-[#37464F] p-3 text-[#52656D]">
      <header className="flex items-center justify-between gap-3">
        <button
          className="text-[#52656D]"
          onClick={() => setNow((now) => now.add(-1, "month"))}
        >
          <ChevronLeftSvg />
          <span className="sr-only">Go to previous month</span>
        </button>
        <h3 className="text-lg font-bold uppercase text-[#DCE6EC]">
          {formattedNowMonth}
        </h3>
        <button
          className="text-[#52656D]"
          onClick={() => setNow((now) => now.add(1, "month"))}
        >
          <ChevronRightSvg />
          <span className="sr-only">Go to next month</span>
        </button>
      </header>
      <div className="flex justify-between px-3 py-2">
        {"SMTWTFS".split("").map((day, i) => {
          return (
            <div key={i} className="flex h-9 w-9 items-center justify-center">
              {day}
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-3 px-3 py-2">
        {calendarDays.map((week, i) => {
          return (
            <div key={i} className="flex justify-between">
              {week.map((date, i) => {
                const isActiveDate =
                  date !== null && isActiveDay(now.date(date));
                const isCurrentDate =
                  date === staticNow.date() &&
                  now.month() === staticNow.month() &&
                  now.year() === staticNow.year();
                return (
                  <div
                    key={i}
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      isActiveDate
                        ? "bg-orange-400 text-white"
                        : isCurrentDate
                          ? "bg-[#37464F] text-white"
                          : "",
                    ].join(" ")}
                  >
                    {date}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </article>
  );
};
