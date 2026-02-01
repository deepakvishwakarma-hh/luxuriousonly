module.exports = {
  apps: [
    {
      name: "be",
      cwd: "./backend",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "fe",
      cwd: "./frontend",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
