"use client";

import { createContext } from "react";

export type DevelopmentApiState =
  | "disabled"
  | "starting"
  | "ready"
  | "failed";

export const DevelopmentApiStateContext =
  createContext<DevelopmentApiState>("disabled");
