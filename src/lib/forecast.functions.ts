import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateForecast } from "./forecast.server";

export const runForecast = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ focus: z.string().max(200).optional() }).parse(data ?? {}),
  )
  .handler(async ({ data }) => generateForecast(data.focus));
