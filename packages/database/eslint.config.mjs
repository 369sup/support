import { createTypeScriptLibraryConfig } from "@support/eslint-config/typescript-library";

export default createTypeScriptLibraryConfig({
  tsconfigRootDir: import.meta.dirname,
});
