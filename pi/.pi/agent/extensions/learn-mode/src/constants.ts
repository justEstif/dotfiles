export const LEARN_OFF_COMMAND = "off";

/** Valid subcommands for the unified /learn command. */
export const LEARN_SUBCOMMANDS = [
  "off",
  "exercise",
  "review",
  "define",
  "act",
  "read",
  "settings",
  "status",
] as const;

export type LearnSubcommand = (typeof LEARN_SUBCOMMANDS)[number];
