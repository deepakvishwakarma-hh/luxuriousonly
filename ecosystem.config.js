module.exports = {
  apps: [
    {
      name: "luxurious-backend",
      cwd: "./backend",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "luxurious-frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
