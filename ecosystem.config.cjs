module.exports = {
  apps: [
    {
      name: "recoup-agent",
      script: "bun",
      args: "start",
      cron_restart: "0 */12 * * *",
      watch: false,
      autorestart: true,
    }, {
      name: "recoup-manager",
      script: "bun",
      args: "lib/agents/manager/listenToSlack.ts",
      cron_restart: "0 */12 * * *",
      watch: false,
      autorestart: true,
    },
  ],
};
