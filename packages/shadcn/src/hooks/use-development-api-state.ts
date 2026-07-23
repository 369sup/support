"use client";

import { useContext } from "react";

import { DevelopmentApiStateContext } from "./development-api-context";

export function useDevelopmentApiState() {
  return useContext(DevelopmentApiStateContext);
}
